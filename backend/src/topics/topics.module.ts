import { forwardRef, Module } from '@nestjs/common';
import { TopicsController } from './topics.controller';
import { TopicsService } from './topics.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Learning, Topic, TopicLearningSchema, TopicSchema } from './topics.schema';
import { AiSuggestionsModule } from 'src/ai-suggestions/ai-suggestions.module';
import { TopicLearningPlanController } from './learning.controller';
import { TopicLearningPlanService } from './learning.service';
import { WordsModule } from 'src/words/words.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Topic.name, schema: TopicSchema },
      { name: Learning.name, schema: TopicLearningSchema }
    ]),
    AiSuggestionsModule,
    WordsModule
  ],
  controllers: [TopicLearningPlanController, TopicsController],
  providers: [TopicsService, TopicLearningPlanService],
  exports: [TopicsService]
})
export class TopicsModule {}
