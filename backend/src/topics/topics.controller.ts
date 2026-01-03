import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { CreateTopicDto, GenerateTopicSuggestionsDto, ListAllTopicsDto, QueryAutoFindTopicDto, UpdateTopicDto } from './topics.dto';
import { GetUser } from 'src/auth/get-user.decorator';
import { AiSuggestionsService } from 'src/ai-suggestions/ai-suggestions.service';
import { DeleteResult, Types } from 'mongoose';

@Controller('topics')
export class TopicsController {
    constructor(private topicsService: TopicsService, private aiSuggestionsService: AiSuggestionsService) {}

    @Post()
    async createTopic(@Body() createTopicDto: CreateTopicDto, @GetUser('userId') id: Types.ObjectId) {
        return this.topicsService.create(createTopicDto, id)
    }

    @Get()
    async findAll(@Query() query: ListAllTopicsDto) {
        return this.topicsService.findAll(query)
    }

    @Get('auto-pick')
    async autoFindTopic(@Query() dto: QueryAutoFindTopicDto, @GetUser('userId') userId: Types.ObjectId ) {
        return this.topicsService.autoPickTopic(userId, dto.topicId)
    }

    @Get(':id')
    async findOne(@Param('id') id: Types.ObjectId) {
        return this.topicsService.findOne(id)
    }

    @Patch(':id')
    async update(@Param('id') id: Types.ObjectId, @Body() updateTopicDto: UpdateTopicDto) {
        return this.topicsService.update(id, updateTopicDto)
    }

    @Delete(':id')
    async deleteTopic(@Param('id') id: string): Promise<DeleteResult> {
        return this.topicsService.deleteOne(new Types.ObjectId(id))
    }
    
    //--------------------------------------------------
    @Post('/suggestions')
    async generateSuggestions(@Body() generateTopicSuggestionsDto: GenerateTopicSuggestionsDto) {
        return this.aiSuggestionsService.generateTopicSuggestions(generateTopicSuggestionsDto)
    }

   

}
