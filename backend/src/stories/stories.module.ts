import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Story, StorySchema } from "./stories.schema";
import { StoryMessage, StoryMessageSchema } from "./story-message.schema";
import { StoriesService } from "./stories.service";
import { StoriesController } from "./stories.controller";
import { TopicsModule } from "src/topics/topics.module";
import { WordsModule } from "src/words/words.module";
import { AiSuggestionsModule } from "src/ai-suggestions/ai-suggestions.module";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Story.name, schema: StorySchema },
            { name: StoryMessage.name, schema: StoryMessageSchema },
        ]),
        TopicsModule,
        WordsModule,
        AiSuggestionsModule,
    ],
    providers: [StoriesService],
    controllers: [StoriesController],
    exports: [StoriesService],
})
export class StoriesModule {}
