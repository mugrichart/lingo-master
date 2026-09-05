import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { ConfigService } from "@nestjs/config";
import { Character, CharacterDocument } from "./characters.schema";
import { ChatMessage } from "./chat-message.schema";
import { CreateCharacterDto } from "./characters.dto";
import { AiSuggestionsService } from "src/ai-suggestions/ai-suggestions.service";
import { FileStorageService } from "src/file-storage/file-storage.service";

@Injectable()
export class CharactersService {
    constructor(
        @InjectModel(Character.name) private characterModel: Model<Character>,
        @InjectModel(ChatMessage.name) private chatMessageModel: Model<ChatMessage>,
        private aiSuggestionsService: AiSuggestionsService,
        private fileStorageService: FileStorageService,
        private configService: ConfigService,
    ) {}

    /** Creates a pending character immediately, then fills fields + generates the avatar in the background. */
    async create(userId: Types.ObjectId, dto: CreateCharacterDto): Promise<CharacterDocument> {
        const character = await this.characterModel.create({
            creator: userId,
            name: dto.name?.trim() || '',
            appearance: dto.appearance?.trim() || '',
            bio: dto.description?.trim() || '',
            status: 'pending'
        })
        // fire-and-forget: the dialog closes immediately and the character fills in asynchronously
        void this.generateCharacter(character._id as Types.ObjectId, dto).catch(async (err) => {
            console.error('character generation failed', err?.message)
            await this.characterModel.findByIdAndUpdate(character._id, { status: 'failed' }).exec()
        })
        return character
    }

    private async generateCharacter(characterId: Types.ObjectId, dto: CreateCharacterDto) {
        const filled = await this.aiSuggestionsService.fillCharacterFields(dto)

        let avatar = ''
        const image = await this.aiSuggestionsService.generateAvatarImage(filled.avatarPrompt)
        if (image) {
            const key = `avatars/characters/${characterId}.png`
            await this.fileStorageService.upload(image, key, 'image/*')
            avatar = `https://${this.configService.get('aws.AWS_BUCKET_NAME')}.s3.${this.configService.get('aws.AWS_REGION')}.amazonaws.com/${key}`
        }

        await this.characterModel.findByIdAndUpdate(characterId, {
            name: dto.name?.trim() || filled.name,
            description: filled.description,
            bio: dto.description?.trim() || filled.bio,
            appearance: dto.appearance?.trim() || filled.appearance,
            avatar,
            status: 'ready'
        }).exec()
    }

    async findAll(userId: Types.ObjectId) {
        return this.characterModel.find({ creator: userId }).sort({ createdAt: -1 }).exec()
    }

    async findOne(userId: Types.ObjectId, id: Types.ObjectId) {
        const character = await this.characterModel.findOne({ _id: id, creator: userId }).populate('expertise').exec()
        if (!character) throw new NotFoundException('Character not found')
        return character
    }

    async addExpertise(userId: Types.ObjectId, id: Types.ObjectId, topic: Types.ObjectId) {
        const character = await this.characterModel.findOneAndUpdate(
            { _id: id, creator: userId },
            { $addToSet: { expertise: topic } },
            { new: true }
        ).populate('expertise').exec()
        if (!character) throw new NotFoundException('Character not found')
        return character
    }

    async findMessages(userId: Types.ObjectId, characterId: Types.ObjectId) {
        await this.findOne(userId, characterId) // ensures ownership
        return this.chatMessageModel.find({ character: characterId }).sort({ createdAt: 1 }).exec()
    }

    async saveUserMessage(characterId: Types.ObjectId, text: string) {
        return this.chatMessageModel.create({ character: characterId, role: 'user', text })
    }

    async saveCharacterMessage(characterId: Types.ObjectId, text: string) {
        return this.chatMessageModel.create({ character: characterId, role: 'character', text })
    }

    /** LLM reply for a user message, grounded in the character's persona + expertise. (Mock-free but simple.) */
    async replyTo(character: CharacterDocument, history: { role: 'user' | 'character', text: string }[], userText: string): Promise<string> {
        const expertise = (character.expertise ?? []) as unknown as { name?: string }[]
        return this.aiSuggestionsService.characterChatReply({
            name: character.name,
            description: character.description,
            bio: character.bio,
            expertise
        }, history, userText)
    }
}
