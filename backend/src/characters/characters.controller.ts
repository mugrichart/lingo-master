import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { Types } from "mongoose";
import { CharactersService } from "./characters.service";
import { AddExpertiseDto, ChatMessageDto, CreateCharacterDto } from "./characters.dto";
import { GetUser } from "src/auth/get-user.decorator";

@Controller('characters')
export class CharactersController {
    constructor(private charactersService: CharactersService) {}

    @Post()
    create(@GetUser('userId') userId: Types.ObjectId, @Body() dto: CreateCharacterDto) {
        return this.charactersService.create(userId, dto)
    }

    @Get()
    findAll(@GetUser('userId') userId: Types.ObjectId) {
        return this.charactersService.findAll(userId)
    }

    @Get(':id')
    findOne(@GetUser('userId') userId: Types.ObjectId, @Param('id') id: Types.ObjectId) {
        return this.charactersService.findOne(userId, id)
    }

    @Get(':id/messages')
    findMessages(@GetUser('userId') userId: Types.ObjectId, @Param('id') id: Types.ObjectId) {
        return this.charactersService.findMessages(userId, id)
    }

    @Post(':id/messages')
    async sendMessage(@GetUser('userId') userId: Types.ObjectId, @Param('id') id: Types.ObjectId, @Body() dto: ChatMessageDto) {
        const character = await this.charactersService.findOne(userId, id)
        const history = (await this.charactersService.findMessages(userId, id))
            .map(m => ({ role: m.role as 'user' | 'character', text: m.text }))
        await this.charactersService.saveUserMessage(id, dto.text)
        const reply = await this.charactersService.replyTo(character, history, dto.text)
        const saved = await this.charactersService.saveCharacterMessage(id, reply)
        return { reply, message: saved }
    }

    @Post(':id/expertise')
    addExpertise(@GetUser('userId') userId: Types.ObjectId, @Param('id') id: Types.ObjectId, @Body() dto: AddExpertiseDto) {
        return this.charactersService.addExpertise(userId, id, dto.topic)
    }
}
