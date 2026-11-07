import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { QueryTopicLearningPlanDto, RecordCoveredWordsDto, ScoreLearningAttemptDto, UpdateLearningProgressDto } from "./learning.dto";
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

    @Post('covered')
    async recordCoveredWords(@GetUser('userId') userId: Types.ObjectId, @Body() dto: RecordCoveredWordsDto) {
        return this.learningService.recordCoveredWords(userId, dto)
    }

    @Get('resume/:topic')
    async getResume(@GetUser('userId') userId: Types.ObjectId, @Param('topic') topic: Types.ObjectId) {
        return this.learningService.getResume(userId, topic)
    }

    @Post('progress')
    async updateProgress(@GetUser('userId') userId: Types.ObjectId, @Body() dto: UpdateLearningProgressDto) {
        return this.learningService.updateProgress(userId, dto)
    }

    @Post('learned/:topic')
    async markLearned(@GetUser('userId') userId: Types.ObjectId, @Param('topic') topic: Types.ObjectId) {
        return this.learningService.markLearned(userId, topic)
    }

    @Get('my-learning')
    async findMyLearning(@GetUser('userId') userId: Types.ObjectId) {
        return this.learningService.findMyLearning(userId)
    }

    @Get('recent')
    async findRecent(@GetUser('userId') userId: Types.ObjectId) {
        return this.learningService.findRecent(userId)
    }

    @Get('current')
    async findCurrent(@GetUser('userId') userId: Types.ObjectId) {
        return this.learningService.findCurrent(userId)
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
