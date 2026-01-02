import { forwardRef, Module } from '@nestjs/common';
import { WordsController } from './words.controller';
import { WordsService } from './words.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Word, WordSchema } from './words.schema';
import { TopicsModule } from 'src/topics/topics.module';
import { AiSuggestionsModule } from 'src/ai-suggestions/ai-suggestions.module';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: Word.name,
      schema: WordSchema
    }]),
    forwardRef(() => TopicsModule),
    AiSuggestionsModule
],
  controllers: [WordsController],
  providers: [WordsService],
  exports: [WordsService]
})
export class WordsModule {}
