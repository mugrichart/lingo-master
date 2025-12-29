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

    private load_system_prompts(): 
        Record<'topicSuggestions' | 'wordSuggestions' | 'wordSuggestionExpansion' | 'conversationSuggestions' | 'conversationSuggestionExpansion', string> 
    {
        const filePath = path.join(process.cwd(), './src/ai-suggestions/system_prompts.json')
        const systemPromptsFile = fs.readFileSync(filePath, 'utf-8')
        return JSON.parse(systemPromptsFile)
    }
}
