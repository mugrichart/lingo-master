import { Module } from '@nestjs/common';
import { TopicsController } from './topics.controller';
import { TopicsService } from './topics.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Topic, TopicSchema } from './topics.schema';
import { AiSuggestionsModule } from 'src/ai-suggestions/ai-suggestions.module';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: Topic.name,
      schema: TopicSchema
    }]),
    AiSuggestionsModule
  ],
  controllers: [TopicsController],
  providers: [TopicsService]
})
export class TopicsModule {}
