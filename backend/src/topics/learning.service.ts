import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Learning } from "./topics.schema";
import { Model, Types } from "mongoose";
import { ScoreLearningAttemptDto } from "./learning.dto";
import { AiSuggestionsService } from "src/ai-suggestions/ai-suggestions.service";

@Injectable()
export class TopicLearningPlanService {
    constructor(
        @InjectModel(Learning.name) private learningModel: Model<Learning>,
        private aiSuggestionsService: AiSuggestionsService,
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

    async findMastery(user: Types.ObjectId, topic: Types.ObjectId) {
        return this.learningModel.findOne({ user, topic }).exec()
    }

    async scoreAttempt(userId: Types.ObjectId, dto: ScoreLearningAttemptDto) {
        const result = await this.aiSuggestionsService.scoreMastery(dto.records)
        if (dto.persistMastery) {
            await this.learningModel.findOneAndUpdate(
                { user: userId, topic: dto.topic },
                { $set: { topicLevel: result.overallScore } },
                { upsert: true, new: true }
            ).exec()
        }
        return result
    }

}