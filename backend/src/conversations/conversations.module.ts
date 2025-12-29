import { Module } from '@nestjs/common';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { TopicsModule } from 'src/topics/topics.module';
import { WordsModule } from 'src/words/words.module';
import { AiSuggestionsModule } from 'src/ai-suggestions/ai-suggestions.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Conversation, ConversationSchema } from './conversations.schema';

@Module({
  imports: [
    TopicsModule, WordsModule, AiSuggestionsModule,
    MongooseModule.forFeature([{ name: Conversation.name, schema: ConversationSchema }])
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService]
})
export class ConversationsModule {}
