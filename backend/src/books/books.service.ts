import { Injectable, NotFoundException } from '@nestjs/common';
import { QueryPracticePageDto, UploadMetadataDto } from './books.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Book, BookPractice, BookPracticePage, BookPracticeTracking } from './books.schema';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { FileStorageService } from 'src/file-storage/file-storage.service';
import { PdfService } from './pdf.service';
import { PDFDocumentProxy } from 'pdfjs-dist';
import { shuffleArray } from 'src/lib/shuffle';
import { TopicsService } from 'src/topics/topics.service';
import { AiSuggestionsService } from 'src/ai-suggestions/ai-suggestions.service';

@Injectable()
export class BooksService {
    constructor(
        @InjectModel(Book.name) private bookModel: Model<Book>,
        @InjectModel(BookPractice.name) private practiceModel: Model<BookPractice>,
        @InjectModel(BookPracticePage.name) private pageModel: Model<BookPracticePage>,
        @InjectModel(BookPracticeTracking.name) private userTrackingModel: Model<BookPracticeTracking>,
        private configService: ConfigService,
        private fileStorageService: FileStorageService,
        private pdfService: PdfService,
        private topicService: TopicsService,
        private aiSuggestionsService: AiSuggestionsService
    ) {}

    async findAll() {
        return this.bookModel.find().exec()
    }

    async findOne(id: Types.ObjectId) {
        return this.bookModel.findById(id).exec()
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

    async getBookPracticePlan(bookId: Types.ObjectId, userId: Types.ObjectId) {
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

        return this.practiceModel.create({ bookId, user: userId, cursorAt: 0, pages: []})
    }

    async getBookPracticePage(dto: QueryPracticePageDto, userId: Types.ObjectId) {
        try {
            const practice = await this.getBookPracticePlan(dto.bookId, userId)
            if (!practice) {
                throw new NotFoundException(`Practice plan for book with id ${dto.bookId} not found`)
            }
            const pageNumber = dto.pageNumber ?? practice.cursorAt
    
            const pageId = practice.pages[pageNumber]
    
            const pageContent = await this.pageModel.findById(pageId).exec()
            
            return pageContent ? { pageContent, pageNumber } : null
        } catch (error) {
            console.error(error.message)
            throw error            
        }
    }

    async createBookPracticePage(bookId: Types.ObjectId, userId: Types.ObjectId, options: {practicePageIdx?: number, topicId?: Types.ObjectId, wordsPerPage?: number} = {}) {
        const[book, practicePlan] = await Promise.all([ this.bookModel.findOne(bookId), this.getBookPracticePlan(bookId, userId) ])
        if (!book) {
            throw new NotFoundException(`Book with id ${bookId} not found`)
        }
        if (!practicePlan) {
            throw new NotFoundException(`Practice plan for book with id ${bookId} not found`)
        }

        const practicePageIndex = options.practicePageIdx ?? practicePlan.pages.length // 0-indexed in the practice plan -> next page
        const lastPageIndex = book.endingPage - book.startingPage // We have the user tell us the first page the reading actually starts, and where it ends
        if (practicePageIndex > lastPageIndex) {
            throw new NotFoundException(`Last page of the book is ${book.endingPage}`)
        }

        const pdfFile: PDFDocumentProxy = await this.pdfService.getPdf(book.pdfUrl)
        const pageNumber = practicePageIndex + book.startingPage
        const pageContent = await this.pdfService.getPageContent(pdfFile, pageNumber)
        // fetching the relevant words to practice with, and under which topic

        const learning = await this.topicService.autoPickTopic(userId, options.topicId)
        if (!learning) {
            throw new NotFoundException(`Learning plan not found`)
        }
        const howMany = options.wordsPerPage || 2 // We want to insert two words in the page content
        const shuffled = shuffleArray(learning.words)
        const words = shuffled.slice(0, howMany).flatMap(w => w ? [{ word: w.word, example: w.example}] : [])
        const topic = learning.topic?.name ?? ""

        // Insert the words in the page content with the help of ai
        const augmentedPageContent = await this.aiSuggestionsService.bookPageAugmentation(book.title, topic, words, pageContent)
        
        return {
            pageContent: { text: augmentedPageContent, words: words.map(w => w.word), options: shuffleArray(words.flatMap(w => w ? [w.word] : [])) },
            pageNumber: 0
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
