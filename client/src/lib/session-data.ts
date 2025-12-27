import { Topic, Word, TopicSuggestion, WordSuggestion, ConvoSuggestion, Convo } from '@/lib/definitions'

import { cookies } from 'next/headers'
import { PracticeBook, PracticeBookPage } from './definitions'




type FetchTopicsQuery = {
    parent?: string | null, // parent topic
    creator?: string, // creator id
    myLearning?: string, // topic learning data for this user
    language?: string,
}

const UserSchema = z.object({
    username: z.string(),
    email: z.email(),
    avatar: z.string().optional()
})

export async function fetchUserProfile() {
    const headers = await getHeaders()
    try {
        return apiRequest(`/users/profile`, UserSchema, {
            method: 'GET',
            headers
        })

    } catch (error) {
        console.error(error)
        throw new Error('Error fetching user')
    }
}

import z from 'zod';
import { apiRequest } from './api-client'

const TopicSchema = z.object({
    _id: z.string(),
    name: z.string(),
    language: z.string(),
    creator: z.string(),
    words: z.array(z.string()),
    parent: z.string().nullable(),
    isAiGenerated: z.boolean()
})

const TopicsSchema = z.array(TopicSchema);

export async function fetchTopics(query: FetchTopicsQuery = {}): Promise<Topic[]> {
    const headers = await getHeaders()
    try {
        const queryParams = new URLSearchParams(query as any).toString()
        console.log(queryParams, 'queryParams', query)
        return apiRequest(`/topics?${queryParams}`, TopicsSchema,  {
            method: 'GET',
            headers,
            next: { revalidate: 60 }
        })

    } catch (error) {
        console.error(error)
        throw new Error('Error fetching Topics')
    }
}

export async function fetchTopicByID(id: string): Promise<Topic> {
    const headers = await getHeaders()
    try {
        return apiRequest(`/topics/${id}`, TopicSchema, {
            method: 'GET',
            headers
        })
        
    } catch (error) {
        console.error(error)
        throw new Error('Error fetching The topic')
    }
}

export async function fetchTopicSuggestions(topic: Topic | null): Promise<{ topics: TopicSuggestion[]}> {
    const headers = await getHeaders()
    try {
        const topics = await fetchTopics(topic ? { parent: topic?._id } : {})
        return apiRequest(
            `/topics/suggestions`,
            z.object({ topics: z.array(z.string())}),
            {
                method: 'POST',
                headers,
                body: JSON.stringify({parentTopic: topic?.name, alreadyExistingTopics: topics?.map(t => t.name)})
            }
        )
    } catch (error) {
        console.error(error)
        throw new Error('Error fetching topic suggestions')
    }
}

export async function fetchPracticeBookPage(bookID: string, page?: number): Promise<{ page: PracticeBookPage, cursorAt: number}> {

    const queryParams = new URLSearchParams({ bookID, page: page?.toString() || "" })
    const headers = await getHeaders()

    try {        
        const response = await fetch(`/practice-with-books/practice?${queryParams}`, {
            headers
        })
        return response.json()
    } catch (error) {
        console.error(error)
        throw new Error("Error fetching practice book page")
    }
}

export async function fetchPracticeTracking(): Promise<{ practiceTracking: { user: string, score: number} }>{
    const headers = await getHeaders()
    try {
        const response = await fetch(`/practice-with-books/tracking`, {
            headers
        })

        return response.json()
    } catch (error) {
        console.error(error)
        throw new Error("Error fetching practice tracking")
    }
}

export async function fetchPracticeBooks(): Promise<{ books: PracticeBook[], practiceTracking: { user: string, score: number} }> {
    const headers = await getHeaders()
    try {
        const response = await fetch(`/practice-with-books`, {
            headers
        })
        return response.json()
    } catch (error) {
        console.error(error)
        throw new Error("Error fetching practice books")
    }
}

async function getHeaders() {
    const sessionToken = (await cookies()).get("sessionToken")?.value
    return {
        "content-type": "application/json",
        "Authorization": `Bearer ${sessionToken}`
    }
}