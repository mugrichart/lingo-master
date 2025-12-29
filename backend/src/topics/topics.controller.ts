import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { CreateTopicDto, GenerateTopicSuggestionsDto, ListAllTopicsDto, UpdateTopicDto } from './topics.dto';
import { GetUser } from 'src/auth/get-user.decorator';
import { AiSuggestionsService } from 'src/ai-suggestions/ai-suggestions.service';
import { Types } from 'mongoose';

@Controller('topics')
export class TopicsController {
    constructor(private topicsService: TopicsService, private aiSuggestionsService: AiSuggestionsService) {}

    @Post()
    async createTopic(@Body() createTopicDto: CreateTopicDto, @GetUser('userID') id: Types.ObjectId) {
        return this.topicsService.create(createTopicDto, id)
    }

    @Get()
    async findAll(@Query() query: ListAllTopicsDto) {
        return this.topicsService.findAll(query)
    }

    @Get(':id')
    async findOne(@Param('id') id: Types.ObjectId) {
        return this.topicsService.findOne(id)
    }

    @Put(':id')
    async update(@Param('id') id: Types.ObjectId, @Body() updateTopicDto: UpdateTopicDto) {
        return this.topicsService.update(id, updateTopicDto)
    }
    
    @Post('/suggestions')
    async generateSuggestions(@Body() generateTopicSuggestionsDto: GenerateTopicSuggestionsDto) {
        return this.aiSuggestionsService.generateTopicSuggestions(generateTopicSuggestionsDto)
    }

}
