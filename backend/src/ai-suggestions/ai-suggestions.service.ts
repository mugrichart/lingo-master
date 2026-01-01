import { Injectable } from '@nestjs/common';
import { PromptsProvider } from './prompts_generation.service';
import OpenAI
 from 'openai';
import { GenerateTopicSuggestionsDto } from 'src/topics/topics.dto';
import { ChatCompletionSystemMessageParam, ChatCompletionUserMessageParam } from 'openai/resources';
import { ExpandWordSuggestionDto, GenerateWordSuggestionsDto } from 'src/words/words.dto';
import { WordDocument } from 'src/words/words.schema';
import { ConversationDocument } from 'src/conversations/conversations.schema';

type OPENAI_MODELS = 'gpt-4o' | 'gpt-4o-mini' | 'gpt-3.5-turbo'

@Injectable()
export class AiSuggestionsService {
    private readonly openaiClient = new OpenAI({apiKey: process.env.OPENAI_API_KEY})

    constructor(private promptsProvider: PromptsProvider) {}

    async generateTopicSuggestions(dto: GenerateTopicSuggestionsDto): Promise<{ topics: string[] }> {
       const { userPrompt, systemPrompt } = this.promptsProvider.topicSuggestionsPromptsGenerator(dto.parentTopic, dto.alreadyExistingTopics)
       const suggestionsString = await this.openaiHandle("gpt-4o-mini", systemPrompt, userPrompt, true)
       return JSON.parse(suggestionsString)
    }

    async generateWordSuggestions(dto: GenerateWordSuggestionsDto): Promise<{ words: {word: string, example: string}[] }> {
       const { userPrompt, systemPrompt } = this.promptsProvider.wordSuggestionsPromptsGenerator(dto.topic, dto.alreadyExistingWords)
       const suggestionsString = await this.openaiHandle("gpt-4o-mini", systemPrompt, userPrompt, true)
       return JSON.parse(suggestionsString)
    }

    async expandWordSuggestion(dto: ExpandWordSuggestionDto): Promise<Omit<WordDocument, '_id'>> {
        const { userPrompt, systemPrompt} = this.promptsProvider.wordSuggestionExpansionPromptGenerator(dto.word, dto.example)
        const expansionString = await this.openaiHandle("gpt-4o-mini", systemPrompt, userPrompt, true)
        return JSON.parse(expansionString)
    }

    async generateConversationSuggestions(topic: string, words: string[]): Promise<{title: string, description: string, suggestedWords: string[]}[]> {
        const { userPrompt, systemPrompt} = this.promptsProvider.conversationSuggestionsPromptGenerator(topic, words)
        const suggestionsString = await this.openaiHandle("gpt-4o-mini", systemPrompt, userPrompt, true)
        return JSON.parse(suggestionsString)
    }
    
    async expandConversationSuggestion(
        title: string, description: string, suggestedWords: string[]
    ): Promise<Omit<ConversationDocument, '_id' | 'isAiGenerated'>> {
        const { userPrompt, systemPrompt} = this.promptsProvider.conversationSuggestionExpansionPromptGenerator(title, description, suggestedWords)
        const suggestionsString = await this.openaiHandle("gpt-4o", systemPrompt, userPrompt, true)
        return JSON.parse(suggestionsString)
    }
    
    async bookPageAugmentation (title: string, topic: string, words: { word: string, example: string}[], pageContent: string) {
        const { userPrompt, systemPrompt} = this.promptsProvider.bookPageAugmentationPromptGenerator(title, topic, words, pageContent)
        const suggestionsString = await this.openaiHandle("gpt-4o-mini", systemPrompt, userPrompt)
        return suggestionsString
    }

    private async openaiHandle(model: OPENAI_MODELS, systemPrompt: string, userPrompt: string, request_structured_output: boolean = false) {
        const messages: [ChatCompletionSystemMessageParam, ChatCompletionUserMessageParam] = [
            { role: "system", content: systemPrompt},
            { role: "user", content: userPrompt}
        ]
        const shouldUseJsonFormat = ['gpt-4o', 'gpt-4o-mini'].includes(model) && request_structured_output;
        const hasJsonInMessages = messages.some(msg => 
            (msg.content as string).toLowerCase().includes('json')
        );
        try {
            const chatCompletion = await this.openaiClient.chat.completions.create({
                model,
                messages,
                ...(shouldUseJsonFormat && hasJsonInMessages && { 
                    response_format: { type: "json_object" } 
                })
            });

            const content = chatCompletion.choices[0].message.content

            if (!content) throw new Error('Null response from Openai')
            
            return content
            
        } catch (error) {
            console.error(error.message)
            throw new Error(`Error with openai request: ${error}`)
        }
    }
}
