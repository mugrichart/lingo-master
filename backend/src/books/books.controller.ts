import { Body, Controller, Get, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { UploadMetadataDto } from './books.dto';
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

}
