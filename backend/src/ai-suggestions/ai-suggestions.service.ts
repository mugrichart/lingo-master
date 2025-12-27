import { Injectable } from '@nestjs/common';
import { PromptsProvider } from './prompts_generation.service';
import OpenAI
 from 'openai';
import { GenerateTopicSuggestionsDto } from 'src/topics/topics.dto';
import { ChatCompletionSystemMessageParam, ChatCompletionUserMessageParam } from 'openai/resources';

type OPENAI_MODELS = 'gpt-4o' | 'gpt-4o-mini' | 'gpt-3.5-turbo'

@Injectable()
export class AiSuggestionsService {
    private readonly openaiClient = new OpenAI({apiKey: process.env.OPENAI_API_KEY})

    constructor(private promptsProvider: PromptsProvider) {}

    async generateTopicSuggestions(dto: GenerateTopicSuggestionsDto): Promise<{ topics: string[] }> {
       const { userPrompt, systemPrompt } = this.promptsProvider.topic_suggestions_prompts_generator(dto.parentTopic, dto.alreadyExistingTopics)
       const suggestionsString = await this.openaiHandle("gpt-4o-mini", systemPrompt, userPrompt, true)
       return JSON.parse(suggestionsString)
    }

    async openaiHandle(model: OPENAI_MODELS, systemPrompt: string, userPrompt: string, request_structured_output: boolean) {
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
