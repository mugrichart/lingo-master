import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Learning } from "./topics.schema";
import { Model, Types } from "mongoose";
import { TopicsService } from "./topics.service";
import { WordsService } from "src/words/words.service";


@Injectable()
export class TopicLearningPlanService {
    constructor(
        @InjectModel(Learning.name) private learningModel: Model<Learning>,
        private topicsService: TopicsService,
        private wordsService: WordsService
    ) {}

    async findAll(user?: Types.ObjectId, topic?: Types.ObjectId) {
        const query = {}
        if (topic) query['topic'] = topic
        if (user) query['user'] = user
        return this.learningModel.find(query).exec()
    }

    async findOne(id: Types.ObjectId) {
        return this.learningModel.findById(id)
    }

    async findMostRelevantTopic(userId: Types.ObjectId) {
        const learnings = await this.findAll(userId)
        if (!learnings?.length) {
            throw new NotFoundException('Learning plan not found')
        }
        const sortedByRelevance = learnings.sort((a, b) => b.chunkLevel - a.chunkLevel)
        const mostRelevantTopic = sortedByRelevance[0].topic
        const wordIds = sortedByRelevance[0].words.map(w => w.word)

        const [topic, ...words] = await Promise.all([
            this.topicsService.findOne(mostRelevantTopic), 
            ...wordIds.map(wId => this.wordsService.findOne(wId))
        ])

        return { topic, words }
    }

}