import { Injectable } from "@nestjs/common";
import * as fs from 'fs'
import * as path from 'path'

type PromptGenReturnType = {userPrompt: string, systemPrompt: string}

@Injectable()
export class PromptsProvider {
    private SYSTEM_PROMPTS = this.load_system_prompts()

    topic_suggestions_prompts_generator(parenTopic?: string, alreadyExistingTopics?: string[]): PromptGenReturnType {
        const systemPrompt = this.SYSTEM_PROMPTS['topic_suggestions']
        const userPrompt = `
        You are suggesting a list of 5 topics.
        ${parenTopic ? "The topics should be subtopics of: " + parenTopic : ""}.
        ${alreadyExistingTopics?.length ? "Exclude these already known topics: " + alreadyExistingTopics.toString() : ""}
        `
        return { userPrompt, systemPrompt }
    }

    private load_system_prompts(): Record<'topic_suggestions', string> {
        const filePath = path.join(process.cwd(), './src/ai-suggestions/system_prompts.json')
        const systemPromptsFile = fs.readFileSync(filePath, 'utf-8')
        return JSON.parse(systemPromptsFile)
    }
}
