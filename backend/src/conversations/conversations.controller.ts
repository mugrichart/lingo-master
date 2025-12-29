import { Controller, Get, Param, Query } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Controller('conversations')
export class ConversationsController {
    constructor( private conversationsService: ConversationsService) {}

    @Get('/suggestions')
    async generateConversationSuggestions(@Query('topicId', ParseObjectIdPipe) topicId: Types.ObjectId) {
        return this.conversationsService.generateConversationsSuggestions(topicId)
    }
}
