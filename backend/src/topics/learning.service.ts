import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Learning } from "./topics.schema";
import { Model, Types } from "mongoose";


@Injectable()
export class TopicLearningPlanService {
    constructor(
        @InjectModel(Learning.name) private learningModel: Model<Learning>
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

}