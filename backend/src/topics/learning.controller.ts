import { Controller, Get, Param, Query } from "@nestjs/common";
import { QueryTopicLearningPlanDto } from "./learning.dto";
import { GetUser } from "src/auth/get-user.decorator";
import { Types } from "mongoose";
import { TopicLearningPlanService } from "./learning.service";

@Controller('topics/learning')
export class TopicLearningPlanController {
    constructor(private learningService: TopicLearningPlanService) {}

    @Get()
    async findAll(@Query() dto: QueryTopicLearningPlanDto) {
        return this.learningService.findAll(dto.user, dto.topic)
    }

    @Get(':id')
    async findOne(@Param('id') id: Types.ObjectId) {
        return this.learningService.findOne(id)
    }
}