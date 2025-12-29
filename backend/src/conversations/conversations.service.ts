import { Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { AiSuggestionsService } from 'src/ai-suggestions/ai-suggestions.service';
import { TopicsService } from 'src/topics/topics.service';
import { WordsService } from 'src/words/words.service';

@Injectable()
export class ConversationsService {
    constructor(private aiSuggestionsService: AiSuggestionsService, private topicsService: TopicsService, private wordsService: WordsService) {}

    async generateConversationsSuggestions(topicId: Types.ObjectId) {
        try {
            const topic = await this.topicsService.findOne(topicId)
            if (!topic) {
                throw new NotFoundException(`Topic with id ${topicId} not found`)
            }

            const words = await Promise.all(topic.words.map(wId => this.wordsService.findOne(wId)))
           
            return this.aiSuggestionsService.generateConversationSuggestions(topic.name, words.flatMap(w => w?.word ? [w.word] : []))

        } catch (error) {
            console.log(error.message)
            throw error
        }
    }
}
