import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, DeleteResult, Model, Types } from 'mongoose';
import { Topic, TopicDocument } from './topics.schema';
import { CreateTopicDto, ListAllTopicsDto, UpdateTopicDto } from './topics.dto';
import { TopicLearningPlanService } from './learning.service';
import { WordsService } from 'src/words/words.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { WordDocument } from 'src/words/words.schema';

@Injectable()
export class TopicsService {
    constructor(
        @InjectModel(Topic.name) private topicModel: Model<Topic>,
        private topicLearningService: TopicLearningPlanService,

        @Inject(forwardRef(() => WordsService))
        private wordsService: WordsService,

        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) {}

    async create(createDto: CreateTopicDto, userId: Types.ObjectId) {
        return this.topicModel.create({...createDto, creator: userId})
    }

    async findAll(query: ListAllTopicsDto): Promise<TopicDocument[]> {
        const filters: Record<PropertyKey, Types.ObjectId | boolean> = {}
        
        Object.keys(query).map((key) => {
            if (query[key] !== undefined) {
                filters[key] = query[key]
            }
        })
        try {
            return this.topicModel.find(filters).exec()
        } catch (error) {
            console.log(error.message)
            throw new Error('Error fetching topics')
        }

    }

    async findOne(id: Types.ObjectId): Promise<TopicDocument | null> {
        return this.topicModel.findById(id).exec()
    }

    async deleteOne(id: Types.ObjectId): Promise<DeleteResult> {
        return this.topicModel.deleteOne(id)
    }

    /**
     * Picks the most relevant topic for the user
     * @param userId The ID of the learner
     * @param topicId The ID of an optional topic in case the learner picks the topic
     */
    async autoPickTopic(userId: Types.ObjectId, topicId?: Types.ObjectId) {
        const key = `user=${userId}-topic=${topicId}`
        const value = await this.cacheManager.get(key)
        if (value) return value as { topic: TopicDocument, words: [WordDocument]}
        else {
            if (topicId) {
                const topic = await this.findOne(topicId)
                if (!topic) {
                    throw new NotFoundException('Topic not found')
                }
                const words = await Promise.all(topic.words.map(wId => this.wordsService.findOne(wId)))
                return { topic, words }
            }
            const learnings = await this.topicLearningService.findAll(userId)
            if (!learnings?.length) {
                throw new NotFoundException('Learning plan not found')
            }
            const sortedByRelevance = learnings.sort((a, b) => b.chunkLevel - a.chunkLevel)
            const mostRelevantTopic = sortedByRelevance[0].topic
            const wordIds = sortedByRelevance[0].words.map(w => w.word)
    
            const [topic, ...words] = await Promise.all([
                this.findOne(mostRelevantTopic), 
                ...wordIds.map(wId => this.wordsService.findOne(wId))
            ])
            await this.cacheManager.set(key, { topic, words })
            return { topic, words }
        }

    }

    async update(id: Types.ObjectId, updateDto: UpdateTopicDto) {
        return this.topicModel.findByIdAndUpdate(id, updateDto, { new: true}).exec()
    }

    /**
     * Adds a word reference to a topic.
     * @param topicId The ID of the topic to update
     * @param wordId The ID of the word to add
     * @param session Optional session for transactions
     */
    async addNewWord(
        topicId: Types.ObjectId, 
        wordId: Types.ObjectId, 
        session?: ClientSession
    ) {
        // In Mongoose, you can pass the session directly in the options object.
        // If session is undefined, Mongoose simply ignores it.
        return this.topicModel.updateOne(
            { _id: topicId },
            { $push: { words: wordId } },
            { session } 
        );
    }
    
    /**
     * Adds a conversation reference to a topic.
     * @param topicId The ID of the topic to update
     * @param conversationId The ID of the conversation to add
     * @param session Optional session for transactions
     */
    async addNewConversation(
        topicId: Types.ObjectId,
        conversationId: Types.ObjectId,
        session?: ClientSession
    ) {
        return this.topicModel.updateOne(
            { _id: topicId },
            { $push: { conversations: conversationId }},
            { session }
        )
    }

}
