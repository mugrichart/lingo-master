import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CharactersController } from './characters.controller';
import { CharactersService } from './characters.service';
import { Character, CharacterSchema } from './characters.schema';
import { ChatMessage, ChatMessageSchema } from './chat-message.schema';
import { AiSuggestionsModule } from 'src/ai-suggestions/ai-suggestions.module';
import { FileStorageModule } from 'src/file-storage/file-storage.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Character.name, schema: CharacterSchema },
      { name: ChatMessage.name, schema: ChatMessageSchema }
    ]),
    AiSuggestionsModule,
    FileStorageModule
  ],
  controllers: [CharactersController],
  providers: [CharactersService],
  exports: [CharactersService]
})
export class CharactersModule {}
