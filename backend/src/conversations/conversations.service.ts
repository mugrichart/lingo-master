import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AiSuggestionsService } from 'src/ai-suggestions/ai-suggestions.service';
import { TopicsService } from 'src/topics/topics.service';
import { WordsService } from 'src/words/words.service';
import { Conversation, ConversationDocument } from './conversations.schema';
import { ConversationSuggestionExpansionDto } from './conversations.dto';

@Injectable()
export class ConversationsService {
    constructor(
        private aiSuggestionsService: AiSuggestionsService, 
        private topicsService: TopicsService, 
        private wordsService: WordsService,
        @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>
    ) {}

    async findAll(topicId: Types.ObjectId) {
        try {
            const topic = await this.topicsService.findOne(topicId)
            if (!topic) {
                throw new NotFoundException(`Topic with id ${topicId} not found`)
            }
            return Promise.all(topic.conversations.map(cId => this.findOne(cId)))
        } catch (error) {
            console.error(error.message)
            throw error
        }
    }

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

    async expandConversationSuggestion(dto: ConversationSuggestionExpansionDto) {
        return this.aiSuggestionsService.expandConversationSuggestion(dto.title, dto.description, dto.suggestedWords)
    }

    async findOne(conversationId: Types.ObjectId) {
        return this.conversationModel.findById(conversationId).exec()
    }
}


