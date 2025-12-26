import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Topic, TopicDocument } from './topics.schema';
import { CreateTopicDto, ListAllTopicsDto, UpdateTopicDto } from './topics.dto';

@Injectable()
export class TopicsService {
    constructor(@InjectModel(Topic.name) private topicModel: Model<Topic>) {}

    async create(createDto: CreateTopicDto, userID: string) {
        console.log(userID)
        return this.topicModel.create({...createDto, creator: userID})
    }

    async findAll(query: ListAllTopicsDto): Promise<TopicDocument[]> {
        const filters: Record<PropertyKey, string | boolean> = {}
        
        Object.keys(query).map((key) => {
            if (query[key] !== undefined && query[key] !== null) {
                filters[key] = query[key]
            }
        })

        return this.topicModel.find(filters).exec()
    }

    async findOne(id: string): Promise<TopicDocument | null> {
        return this.topicModel.findById(id).exec()
    }

    async update(id: string, updateDto: UpdateTopicDto) {
        console.log(updateDto)
        return this.topicModel.findByIdAndUpdate(id, updateDto, { new: true}).exec()
    }
}
