import { Injectable } from "@nestjs/common";
import * as fs from 'fs'
import * as path from 'path'

type PromptGenReturnType = {userPrompt: string, systemPrompt: string}

@Injectable()
export class PromptsProvider {
    private SYSTEM_PROMPTS = this.load_system_prompts()

    topicSuggestionsPromptsGenerator(parenTopic?: string, alreadyExistingTopics?: string[]): PromptGenReturnType {
        const systemPrompt = this.SYSTEM_PROMPTS['topicSuggestions']
        const userPrompt = `
        You are suggesting a list of 5 topics.
        ${parenTopic ? "The topics should be subtopics of: " + parenTopic : ""}.
        ${alreadyExistingTopics?.length ? "Exclude these already known topics: " + alreadyExistingTopics.toString() : ""}
        `
        return { userPrompt, systemPrompt }
    }

    wordSuggestionsPromptsGenerator(topic: string, alreadyExistingWords?: string[]): PromptGenReturnType {
        const systemPrompt = this.SYSTEM_PROMPTS['wordSuggestions']
        const userPrompt = `
        You are suggesting a list of 5 words.
        The words should fall under topic: ${topic}.
        ${alreadyExistingWords?.length ? "Exclude these already known words: " + alreadyExistingWords.join(', ') : ""}
        `
        return { userPrompt, systemPrompt }
    }

    wordSuggestionExpansionPromptGenerator(word: string, example: string): PromptGenReturnType {
        const systemPrompt = this.SYSTEM_PROMPTS['wordSuggestionExpansion']
        const userPrompt = `
        You are expanding a word given to you and you are returning a structured expanded version
        The word: ${word}
        The example: ${example}
        `
        return { userPrompt, systemPrompt }
    }

    conversationSuggestionsPromptGenerator(topic: string, words: string[]): PromptGenReturnType {
        const systemPrompt = this.SYSTEM_PROMPTS['conversationSuggestions']
        const userPrompt = `
        You are suggesting a list of 5 conversations
        The topic: ${topic}
        The words: ${words}
        `
        return { userPrompt, systemPrompt }
    }

    conversationSuggestionExpansionPromptGenerator(title: string, description: string, suggestedWords: string[]): PromptGenReturnType {
        const systemPrompt = this.SYSTEM_PROMPTS['conversationSuggestionExpansion']
        const userPrompt = `
        You are fleshing out this conversation and you are returning a structured expanded version.
        The title: ${title}
        The description: ${description}
        Suggested Words: ${suggestedWords}
        `
        return { userPrompt, systemPrompt }
    }

    bookPageAugmentationPromptGenerator(title: string, topic: string, words: { word: string, example: string}[], pageContent: string) {
        const systemPrompt = this.SYSTEM_PROMPTS['bookPageAugmentation']
        const userPrompt = `
        The title: ${title}

        The topic: ${topic}

        The words:
            ${words.map(w => `-> word: ${w.word}, example: ${w.example}`).join(' \n')}

        The page content:
        ${pageContent}`
        return { userPrompt, systemPrompt }
    }

    masteryScoringPromptGenerator(records: { word: string, meaning: string, userDefinition: string, example: string, userSentence: string }[]): PromptGenReturnType {
        const systemPrompt = this.SYSTEM_PROMPTS['masteryScoring']
        const userPrompt = `
        Score the student's mastery for each of these ${records.length} word/expression records:
        ${records.map((r, i) => `
        Record ${i + 1}:
            word: ${r.word}
            expected meaning: ${r.meaning}
            student's definition: ${r.userDefinition}
            example sentence: ${r.example}
            student's sentence: ${r.userSentence}
        `).join('\n')}
        `
        return { userPrompt, systemPrompt }
    }

    characterFillPromptGenerator(input: { name?: string, appearance?: string, description?: string }): PromptGenReturnType {
        const systemPrompt = this.SYSTEM_PROMPTS['characterFill']
        const userPrompt = `
        Fill in the missing fields for this character and produce the avatarPrompt.
        Provided by the user (empty means you must invent it):
            name: ${input.name || '(none)'}
            appearance: ${input.appearance || '(none)'}
            extra description: ${input.description || '(none)'}
        `
        return { userPrompt, systemPrompt }
    }

    characterChatPromptGenerator(character: { name: string, description: string, bio: string, expertise?: { name?: string }[] }, userText: string): PromptGenReturnType {
        const expertise = (character.expertise ?? []).map(e => e?.name).filter(Boolean).join(', ')
        const systemPrompt = this.SYSTEM_PROMPTS['characterChat']
        const userPrompt = `
        You are roleplaying as this character in a chat with a language learner.
            Name: ${character.name}
            Persona: ${character.description}
            Bio: ${character.bio}
            ${expertise ? `Expert in: ${expertise}. Weave this vocabulary in naturally.` : ''}
        Stay fully in character, keep replies conversational and concise (1-3 sentences), and reply to the user's latest message.
        User's latest message: ${userText}
        `
        return { userPrompt, systemPrompt }
    }

    private load_system_prompts(): 
        Record<'topicSuggestions' | 'wordSuggestions' | 'wordSuggestionExpansion' | 'conversationSuggestions' | 'conversationSuggestionExpansion' | 'bookPageAugmentation' | 'masteryScoring' | 'characterFill' | 'characterChat', string> 
    {
        const filePath = path.join(process.cwd(), './src/ai-suggestions/system_prompts.json')
        const systemPromptsFile = fs.readFileSync(filePath, 'utf-8')
        return JSON.parse(systemPromptsFile)
    }
}
