import { Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Book, BookPractice, BookPracticePage, BookPracticePageSchema, BookPracticeSchema, BookPracticeTracking, BookPracticeTrackingSchema, BookSchema } from './books.schema';
import { FileStorageModule } from 'src/file-storage/file-storage.module';
import { PdfService } from './pdf.service';
import { TopicsModule } from 'src/topics/topics.module';
import { AiSuggestionsModule } from 'src/ai-suggestions/ai-suggestions.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Book.name, schema: BookSchema},
      {name: BookPractice.name, schema: BookPracticeSchema},
      {name: BookPracticePage.name, schema: BookPracticePageSchema},
      {name: BookPracticeTracking.name, schema: BookPracticeTrackingSchema},
    ]),
    FileStorageModule, TopicsModule, AiSuggestionsModule
  ],
  controllers: [BooksController],
  providers: [BooksService, PdfService]
})
export class BooksModule {}
