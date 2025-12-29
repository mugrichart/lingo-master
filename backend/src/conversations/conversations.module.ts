import { Module } from '@nestjs/common';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { TopicsModule } from 'src/topics/topics.module';
import { WordsModule } from 'src/words/words.module';
import { AiSuggestionsModule } from 'src/ai-suggestions/ai-suggestions.module';

@Module({
  imports: [TopicsModule, WordsModule, AiSuggestionsModule],
  controllers: [ConversationsController],
  providers: [ConversationsService]
})
export class ConversationsModule {}
