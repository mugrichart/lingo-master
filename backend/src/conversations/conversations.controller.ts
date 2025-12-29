import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ConversationSuggestionExpansionDto } from './conversations.dto';

@Controller('conversations')
export class ConversationsController {
    constructor( private conversationsService: ConversationsService) {}
    @Get()
    async findAll(@Query('topicId', ParseObjectIdPipe) topicId: Types.ObjectId) {
        return this.conversationsService.findAll(topicId)
    }

    @Get('/suggestions')
    async generateConversationSuggestions(@Query('topicId', ParseObjectIdPipe) topicId: Types.ObjectId) {
        return this.conversationsService.generateConversationsSuggestions(topicId)
    }

    @Post('/suggestions/expansion')
    async expandConversationSuggestion(@Body() dto: ConversationSuggestionExpansionDto) {
        return this.conversationsService.expandConversationSuggestion(dto)
    }
}
