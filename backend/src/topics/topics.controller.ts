import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { CreateTopicDto, ListAllTopicsDto, UpdateTopicDto } from './topics.dto';
import { GetUser } from 'src/auth/get-user.decorator';

@Controller('topics')
export class TopicsController {
    constructor(private topicsService: TopicsService) {}

    @Post()
    async createTopic(@Body() createTopicDto: CreateTopicDto, @GetUser('userID') id: string) {
        return this.topicsService.create(createTopicDto, id)
    }

    @Get()
    async findAll(@Query() query: ListAllTopicsDto) {
        return this.topicsService.findAll(query)
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.topicsService.findOne(id)
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateTopicDto: UpdateTopicDto) {
        return this.topicsService.update(id, updateTopicDto)
    }
}
