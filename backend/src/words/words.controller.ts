import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { WordsService } from './words.service';
import { CreateWordDto, ExpandWordSuggestionDto, GenerateWordSuggestionsDto, WordsQueryDto } from './words.dto';
import { AiSuggestionsService } from 'src/ai-suggestions/ai-suggestions.service';

@Controller('words')
export class WordsController {
    constructor(private wordsService: WordsService, private aiSuggestionsService: AiSuggestionsService) {}

    @Get()
    async findAll(@Query() query: WordsQueryDto) {
        return this.wordsService.findAll(query)
    }

    @Post()
    async createWord(@Body() dto: CreateWordDto) {
        return this.wordsService.create(dto)
    }

    @Post('/suggestions')
    async generateWordSuggestions(@Body() dto: GenerateWordSuggestionsDto) {
        return this.aiSuggestionsService.generateWordSuggestions(dto)
    }

    @Post('/suggestions/expand')
    async expandWordSuggestion(@Body() dto: ExpandWordSuggestionDto) {
        return this.aiSuggestionsService.expandWordSuggestion(dto)
    }
}
