import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { QueryPracticePageDto, UploadMetadataDto } from './books.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Book, BookPractice, BookPracticeDocument, BookPracticePage, BookPracticeTracking } from './books.schema';
import { DeleteResult, Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { FileStorageService } from 'src/file-storage/file-storage.service';
import { PdfService } from './pdf.service';
import { PDFDocumentProxy } from 'pdfjs-dist';
import { shuffleArray } from 'src/lib/shuffle';
import { TopicsService } from 'src/topics/topics.service';
import { AiSuggestionsService } from 'src/ai-suggestions/ai-suggestions.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from '@nestjs/cache-manager';
import { WordDocument } from 'src/words/words.schema';

@Injectable()
export class BooksService {
    constructor(
        @InjectModel(Book.name) private bookModel: Model<Book>,
        @InjectModel(BookPractice.name) private practiceModel: Model<BookPractice>,
        @InjectModel(BookPracticePage.name) private pageModel: Model<BookPracticePage>,
        @InjectModel(BookPracticeTracking.name) private userTrackingModel: Model<BookPracticeTracking>,

        @Inject(CACHE_MANAGER) private cacheManager: Cache,

        private configService: ConfigService,
        private fileStorageService: FileStorageService,
        private pdfService: PdfService,
        private topicService: TopicsService,
        private aiSuggestionsService: AiSuggestionsService
    ) {}

    async findAll() {
        return this.bookModel.find().exec()
    }

    async delete(bookId: Types.ObjectId): Promise<DeleteResult> {
        await this.practiceModel.deleteOne({ bookId }).exec()
        return this.bookModel.deleteOne(bookId).exec()
    }

    async findOne(id: Types.ObjectId) {
        const value = await this.cacheManager.get(`book-${id}`)
        if (value) {
            return value
        } else {
            const book = await this.bookModel.findById(id).exec()
            this.cacheManager.set(`book-${id}`, book)
            return book
        }
    }

    async upload(metadata: UploadMetadataDto, files: { bookFile: Express.Multer.File[], bookCover: Express.Multer.File[]}, userId: Types.ObjectId) {

        try {
            const timestamp = Date.now();
            const pdfKey = `books/${timestamp}/pdf`;
            const coverKey = `books/${timestamp}/cover`

            const pdfUrl = `https://${this.configService.get('aws.AWS_BUCKET_NAME')}.s3.${this.configService.get('aws.AWS_REGION')}.amazonaws.com/${pdfKey}`;
            const coverUrl = `https://${this.configService.get('aws.AWS_BUCKET_NAME')}.s3.${this.configService.get('aws.AWS_REGION')}.amazonaws.com/${coverKey}`;
            
            const book = await this.bookModel.create({ ...metadata, pdfUrl, coverUrl})

            await this.fileStorageService.upload(files.bookFile[0].buffer, pdfKey, 'application/pdf')
            await this.fileStorageService.upload(files.bookCover[0].buffer, coverKey, 'image/*')

            return book
        } catch (error) {
            console.error(error.message)
            throw error
        }
    }

    // ---------------------------------------------------------------------

    async getBookPracticePlan(bookId: Types.ObjectId, userId: Types.ObjectId): Promise<BookPracticeDocument | null> {
        // const key = `plan-book=${bookId}-user=${userId}`
        // let plan = await this.cacheManager.get(key)
        // if (plan) return plan as BookPracticeDocument;
        // plan = await this.practiceModel.findOne({ bookId, user: userId}).exec()
        // if (plan) await this.cacheManager.set(key, plan)
        // return plan as BookPracticeDocument

        // no caching. This changes on every page fetch
        return this.practiceModel.findOne({ bookId, user: userId}).exec()
    }

    async createBookPracticePlan(bookId: Types.ObjectId, userId: Types.ObjectId) {
        const[book, practicePlan] = await Promise.all([ this.bookModel.findOne(bookId), this.getBookPracticePlan(bookId, userId) ])
        if (!book) {
            throw new NotFoundException(`Book with id ${bookId} not found`)
        }
        if (practicePlan) {
            return practicePlan
        }

        return this.practiceModel.create({ bookId, user: userId, currentPage: 0, pages: []})
    }

    async getBookPracticePage(dto: QueryPracticePageDto, userId: Types.ObjectId) {
        try {
            const practice = await this.getBookPracticePlan(dto.bookId, userId)
            if (!practice) {
                throw new NotFoundException(`Practice plan for book with id ${dto.bookId} not found`)
            }
            const pageNumber = dto.pageNumber ?? practice.currentPage
    
            const pageId = practice.pages[pageNumber]
    
            const pageContent = await this.pageModel.findById(pageId).exec()
            
            return pageContent ? { pageContent, pageNumber } : null
        } catch (error) {
            console.error(error.message)
            throw error            
        }
    }

    async createBookPracticePage(bookId: Types.ObjectId, userId: Types.ObjectId, options: {practicePageIdx?: number, topicId?: Types.ObjectId, wordsPerPage?: number} = {}) {
        console.time("Measuring time after implementing caching")
        const[book, practicePlan, learning] = await Promise.all([ 
            this.bookModel.findOne(bookId), 
            this.getBookPracticePlan(bookId, userId), 
            this.topicService.autoPickTopic(userId, options.topicId) 
        ])
        if (!book) {
            throw new NotFoundException(`Book with id ${bookId} not found`)
        }
        if (!practicePlan) {
            throw new NotFoundException(`Practice plan for book with id ${bookId} not found`)
        }

        const practicePageIndex = options.practicePageIdx ?? practicePlan.currentPage ?? practicePlan.pages.length // 0-indexed in the practice plan -> next page
        const lastPageIndex = book.endingPage - book.startingPage // We have the user tell us the first page the reading actually starts, and where it ends
        if (practicePageIndex > lastPageIndex) {
            throw new NotFoundException(`Last page of the book is ${book.endingPage}`)
        }

        const pdfFile: PDFDocumentProxy = await this.pdfService.getPdf(book.pdfUrl)
        const pageNumber = practicePageIndex + book.startingPage

        if (!learning) {
            throw new NotFoundException(`Learning plan not found`)
        }
        const howMany = options.wordsPerPage || 2 // We want to insert two words in the page content

        // limiting word set
        const wordSet = learning.words.slice(0, 10)

        // Create the next one in the background and cache for the next fetch
        const [augmentedPageContent, words] = await this.handleAugmentation(book.title, learning.topic?.name, wordSet, pdfFile, pageNumber, howMany, true)
        
        // Create the next one in the background and cache for the next fetch
        this.handleAugmentation(book.title, learning.topic?.name, wordSet, pdfFile, pageNumber + 1, howMany, false)
        
        // Update current page: async
        this.practiceModel.findByIdAndUpdate(practicePlan._id, { currentPage: practicePageIndex + 1 }).exec()
        
        console.timeEnd("Measuring time after implementing caching")

        return {
            pageContent: { text: augmentedPageContent, words: words.map(w => w.word), options: shuffleArray(wordSet.flatMap(w => w ? [w.word] : [])) },
            pageNumber: practicePageIndex
        }

    }

    private async handleAugmentation(title: string, topicH: string | undefined, wordsH: (WordDocument | null)[], pdfFile: PDFDocumentProxy, pageNumber: number, howMany=2, prefersFastResponse=false) {
        const key = `title=${title}-topic=${topicH}-page=${pageNumber}`
        const value = await this.cacheManager.get(key)
        if (value) return value as [string, {word: string, example: string}[]]
        else {
            const shuffled = shuffleArray(wordsH)
            const words = shuffled.slice(0, howMany).flatMap(w => w ? [{ word: w.word, example: w.example}] : [])
            const topic = topicH ?? ""
    
            const pageContent = await this.pdfService.getPageContent(pdfFile, pageNumber)

            // In case it's the first page, we don't want the user waiting for the ai process. It should return the normal page, and then process the next page in the background
            if (prefersFastResponse) {
                return [pageContent, []] as [string, {word: string, example: string}[]]
            }
    
            // Insert the words in the page content with the help of ai
            const augmentedPageContent = await this.aiSuggestionsService.bookPageAugmentation(title, topic, words, pageContent)
            
            await this.cacheManager.set(key, [augmentedPageContent, words], 5*60*1000)
            
            return [augmentedPageContent, words] as [string, {word: string, example: string}[]]
        }
        
    }

    //----------------------------------------------------------------------
    async getUserPracticeTracking(userId: Types.ObjectId) {
        return this.userTrackingModel.findOne({ user: userId }).exec()
    }

    async createUserPracticeTracking(userId: Types.ObjectId) {
        return this.userTrackingModel.create({ user: userId, score: 0})
    }

    async updateUserPracticeTracking(score: number, userId: Types.ObjectId) {
        return this.userTrackingModel.findOneAndUpdate({ user: userId}, { score }, { new: true}).exec()
    }
}
