import { Injectable } from '@nestjs/common';
import { UploadMetadataDto } from './books.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Book } from './books.schema';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { FileStorageService } from 'src/file-storage/file-storage.service';

@Injectable()
export class BooksService {
    constructor(
        @InjectModel(Book.name) private bookModel: Model<Book>,
        private configService: ConfigService,
        private fileStorageService: FileStorageService
    ) {}

    async upload(metadata: UploadMetadataDto, files: { bookFile: Express.Multer.File[], bookCover: Express.Multer.File[]}, userId: Types.ObjectId) {

        const timestamp = Date.now();
        const pdfKey = `books/${timestamp}/pdf`;
        const coverKey = `books/${timestamp}/cover`

        const pdfUrl = `https://${this.configService.get('aws.AWS_BUCKET_NAME')}.s3.${this.configService.get('aws.AWS_REGION')}.amazonaws.com/${pdfKey}`;
        const coverUrl = `https://${this.configService.get('aws.AWS_BUCKET_NAME')}.s3.${this.configService.get('aws.AWS_REGION')}.amazonaws.com/${coverKey}`;
        
        const book = await this.bookModel.create({ ...metadata, pdfUrl, coverUrl})

        await this.fileStorageService.upload(files.bookFile[0].buffer, pdfKey, 'application/pdf')
        await this.fileStorageService.upload(files.bookCover[0].buffer, coverKey, 'image/*')

        return book
    }
}
