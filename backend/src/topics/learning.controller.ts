import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { QueryTopicLearningPlanDto, ScoreLearningAttemptDto } from "./learning.dto";
import { GetUser } from "src/auth/get-user.decorator";
import { Types } from "mongoose";
import { TopicLearningPlanService } from "./learning.service";
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('topics/learning')
export class TopicLearningPlanController {
    constructor(private learningService: TopicLearningPlanService) {}

    @Get()
    async findAll(@Query() dto: QueryTopicLearningPlanDto) {
        return this.learningService.findAll(dto.user, dto.topic)
    }

    @Post('score')
    async scoreAttempt(@GetUser('userId') userId: Types.ObjectId, @Body() dto: ScoreLearningAttemptDto) {
        return this.learningService.scoreAttempt(userId, dto)
    }

    @Post('learned/:topic')
    async markLearned(@GetUser('userId') userId: Types.ObjectId, @Param('topic') topic: Types.ObjectId) {
        return this.learningService.markLearned(userId, topic)
    }

    @Get('my-learning')
    async findMyLearning(@GetUser('userId') userId: Types.ObjectId) {
        return this.learningService.findMyLearning(userId)
    }

    @Get('mastery/:topic')
    async findMastery(@GetUser('userId') userId: Types.ObjectId, @Param('topic') topic: Types.ObjectId) {
        const learning = await this.learningService.findMastery(userId, topic)
        return { topicLevel: learning?.topicLevel ?? null, learnedAt: learning?.learnedAt ?? null }
    }

    @Get(':id')
    async findOne(@Param('id') id: Types.ObjectId) {
        return this.learningService.findOne(id)
    }

}
