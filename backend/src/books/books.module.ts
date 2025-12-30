import { Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Book, BookSchema } from './books.schema';
import { FileStorageModule } from 'src/file-storage/file-storage.module';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: Book.name,
      schema: BookSchema
    }]),
    FileStorageModule
  ],
  controllers: [BooksController],
  providers: [BooksService]
})
export class BooksModule {}
