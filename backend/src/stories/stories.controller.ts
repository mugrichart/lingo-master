import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { StoriesService } from "./stories.service";
import { GetUser } from "src/auth/get-user.decorator";
import { Types } from "mongoose";
import { SendStoryMessageDto, StartStoryDto } from "./stories.dto";

@Controller('stories')
export class StoriesController {
    constructor(private storiesService: StoriesService) {}

    @Post('start')
    async startStory(
        @GetUser('userId') userId: Types.ObjectId,
        @Body() dto: StartStoryDto,
    ) {
        return this.storiesService.startStory(userId, new Types.ObjectId(dto.topicId));
    }

    @Get()
    async findByTopic(
        @GetUser('userId') userId: Types.ObjectId,
        @Query('topicId') topicId: Types.ObjectId,
    ) {
        return this.storiesService.findByTopic(userId, topicId);
    }

    @Get(':id')
    async findOne(
        @GetUser('userId') userId: Types.ObjectId,
        @Param('id') id: Types.ObjectId,
    ) {
        return this.storiesService.findOne(userId, id);
    }

    @Get(':id/messages')
    async getMessages(
        @GetUser('userId') userId: Types.ObjectId,
        @Param('id') id: Types.ObjectId,
    ) {
        return this.storiesService.getMessages(userId, id);
    }

    @Post(':id/messages')
    async sendMessage(
        @GetUser('userId') userId: Types.ObjectId,
        @Param('id') id: Types.ObjectId,
        @Body() dto: SendStoryMessageDto,
    ) {
        return this.storiesService.sendUserMessage(userId, id, dto.text);
    }
}
