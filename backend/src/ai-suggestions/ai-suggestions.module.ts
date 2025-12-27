import { Module } from '@nestjs/common';
import { AiSuggestionsService } from './ai-suggestions.service';
import { PromptsProvider } from './prompts_generation.service';

@Module({
  providers: [AiSuggestionsService, PromptsProvider],
  exports: [AiSuggestionsService]
})
export class AiSuggestionsModule {}
