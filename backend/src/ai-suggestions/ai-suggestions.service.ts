import { Injectable } from '@nestjs/common';
import { PromptsProvider } from './prompts_generation.service';
import OpenAI
 from 'openai';
import { GenerateTopicSuggestionsDto } from 'src/topics/topics.dto';
import { ChatCompletionSystemMessageParam, ChatCompletionUserMessageParam } from 'openai/resources';
import { ExpandWordSuggestionDto, GenerateWordSuggestionsDto } from 'src/words/words.dto';
import { WordDocument } from 'src/words/words.schema';
import { ConversationDocument } from 'src/conversations/conversations.schema';
import { WordAttemptRecordDto } from 'src/topics/learning.dto';

export type WordMasteryResult = { word: string, definitionScore: number, sentenceScore: number, feedback: string }
export type MasteryScoreResult = { results: WordMasteryResult[], overallScore: number, overallPassed: boolean, feedback: string }

type OPENAI_MODELS = 'gpt-4o' | 'gpt-4o-mini' | 'gpt-3.5-turbo' | 'o4-mini'

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
        const suggestionsString = await this.openaiHandle("o4-mini", systemPrompt, userPrompt)
        return suggestionsString
    }

    async scoreMastery(records: WordAttemptRecordDto[]): Promise<MasteryScoreResult> {
        const { userPrompt, systemPrompt } = this.promptsProvider.masteryScoringPromptGenerator(records)
        const scoringString = await this.openaiHandle("gpt-4o-mini", systemPrompt, userPrompt, true)
        return JSON.parse(scoringString)
    }

    /** Fills any missing character profile fields and returns an avatar image prompt. */
    async fillCharacterFields(input: { name?: string, appearance?: string, description?: string }): Promise<{ name: string, description: string, bio: string, appearance: string, avatarPrompt: string }> {
        const { userPrompt, systemPrompt } = this.promptsProvider.characterFillPromptGenerator(input)
        const filled = await this.openaiHandle("gpt-4o-mini", systemPrompt, userPrompt, true)
        return JSON.parse(filled)
    }

    /** Generates an avatar image and returns it as a PNG buffer. */
    async generateAvatarImage(avatarPrompt: string): Promise<Buffer | null> {
        try {
            const result = await this.openaiClient.images.generate({
                model: 'gpt-image-1',
                prompt: avatarPrompt,
                size: '1024x1024'
            })
            const b64 = result.data?.[0]?.b64_json
            if (b64) return Buffer.from(b64, 'base64')
            const url = result.data?.[0]?.url
            if (url) {
                const res = await fetch(url)
                return Buffer.from(await res.arrayBuffer())
            }
            return null
        } catch (error) {
            console.error('avatar generation failed', error?.message)
            return null
        }
    }

    /** In-character chat reply, grounded in the character persona and its topic expertise. */
    async characterChatReply(
        character: { name: string, description: string, bio: string, expertise?: { name?: string }[] },
        history: { role: 'user' | 'character', text: string }[],
        userText: string
    ): Promise<string> {
        const { userPrompt, systemPrompt } = this.promptsProvider.characterChatPromptGenerator(character, userText)
        const messages: any[] = [
            { role: 'system', content: systemPrompt },
            ...history.slice(-20).map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text })),
            { role: 'user', content: userPrompt }
        ]
        try {
            const chatCompletion = await this.openaiClient.chat.completions.create({ model: 'gpt-4o-mini', messages })
            return chatCompletion.choices[0].message.content ?? ''
        } catch (error) {
            console.error('character chat reply failed', error?.message)
            return ''
        }
    }

    async generateStoryScaffold(topic: string, words: { word: string, meaning?: string, example?: string }[]): Promise<{
        title: string,
        setting: string,
        plotSetup: string,
        userRole: { name: string, role: string, description: string },
        cast: { id: string, name: string, role: string, description: string }[],
        targetWords: { word: string, meaning: string, example: string, semanticField: string[] }[],
        openingStoryStarter: string,
        openingActorId: string,
        openingActorLine: string
    }> {
        const { userPrompt, systemPrompt } = this.promptsProvider.storyScaffoldPromptGenerator(topic, words)
        const scaffoldString = await this.openaiHandle("gpt-4o-mini", systemPrompt, userPrompt, true)
        return JSON.parse(scaffoldString)
    }

    async evaluateStoryTurn(input: {
        story: { title: string, setting: string, plotSetup: string, cast: any[] },
        currentWord: { word: string, meaning?: string, example?: string },
        biasWord: string,
        history: { role: string, senderName: string, text: string }[],
        userText: string
    }): Promise<{
        hit: boolean,
        feedback: string,
        dmNarration: string | null,
        actorId: string,
        actorName: string,
        actorLine: string
    }> {
        const { userPrompt, systemPrompt } = this.promptsProvider.storyTurnPromptGenerator(input)
        const turnString = await this.openaiHandle("gpt-4o-mini", systemPrompt, userPrompt, true)
        return JSON.parse(turnString)
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
