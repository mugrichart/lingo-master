import { Body, Controller, Get, NotAcceptableException, NotImplementedException, Post, Put, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { QueryPracticePageDto, UploadMetadataDto } from './books.dto';
import { FileFieldsInterceptor } from "@nestjs/platform-express"
import { BooksService } from './books.service';
import { GetUser } from 'src/auth/get-user.decorator';
import { Types } from 'mongoose';


@Controller('books')
export class BooksController {
    constructor(private booksService: BooksService) {}

    @Get()
    async findAll() {
        return this.booksService.findAll()
    }
    
    @Post('/upload')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'bookFile', maxCount: 1 },
        { name: 'bookCover', maxCount: 1}
    ]))
    async uploadBook(
        @Body() metadata: UploadMetadataDto,
        @UploadedFiles() files: { bookFile: Express.Multer.File[], bookCover: Express.Multer.File[]},
        @GetUser('userID') userId: Types.ObjectId
    ) {
        return this.booksService.upload(metadata, files, userId)
    }

    //---------------------------------------------------------------------
    @Get('/practice/plan')
    async getBookPracticePlan(@Query() dto: QueryPracticePageDto, @GetUser('userID') userId: Types.ObjectId) {
        return this.booksService.getBookPracticePlan(dto.bookId, userId)
    }

    @Post('/practice/plan')
    async createBookPracticePlan(@Body() dto: QueryPracticePageDto, @GetUser('userID') userId: Types.ObjectId) {
        return this.booksService.createBookPracticePlan(dto.bookId, userId)
    }

    @Put('/practice/plan')
    async updateBookPracticePlan() {
        throw new NotImplementedException()
    }
    //---------------------------------------------------------------------
    @Get('/practice/page')
    async getBookPracticePage(@Query() dto: QueryPracticePageDto, @GetUser('userID') userId: Types.ObjectId) {
        return this.booksService.getBookPracticePage(dto, userId)
    }

    @Post('/practice/page')
    async createBookPracticePage(@Body() dto: QueryPracticePageDto, @GetUser('userID') userId: Types.ObjectId) {
        return this.booksService.createBookPracticePage(dto.bookId, userId, dto.pageNumber)
    }


    //--------------------------------------------------------------------
    @Get('/practice/tracking')
    async getUserPracticeTracking(@GetUser('userID') userId: Types.ObjectId) {
        return this.booksService.getUserPracticeTracking(userId)
    }

    @Post('/practice/tracking')
    async createUserPracticeTracking(@GetUser('userID') userId: Types.ObjectId) {
        return this.booksService.createUserPracticeTracking(userId)
    }

    @Put('/practice/tracking')
    async updateUserPracticeTracking(@Body('score') score: number, @GetUser('userID') userId: Types.ObjectId) {
        return this.booksService.updateUserPracticeTracking(score, userId)
    }

}
