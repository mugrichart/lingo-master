import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { Topic, TopicDocument } from './topics.schema';
import { CreateTopicDto, ListAllTopicsDto, UpdateTopicDto } from './topics.dto';

@Injectable()
export class TopicsService {
    constructor(@InjectModel(Topic.name) private topicModel: Model<Topic>) {}

    async create(createDto: CreateTopicDto, userID: Types.ObjectId) {
        return this.topicModel.create({...createDto, creator: userID})
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

    async update(id: Types.ObjectId, updateDto: UpdateTopicDto) {
        console.log(updateDto)
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
}
