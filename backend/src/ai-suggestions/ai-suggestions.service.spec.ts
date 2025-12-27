import { Test, TestingModule } from '@nestjs/testing';
import { AiSuggestionsService } from './ai-suggestions.service';

describe('AiSuggestionsService', () => {
  let service: AiSuggestionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiSuggestionsService],
    }).compile();

    service = module.get<AiSuggestionsService>(AiSuggestionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
