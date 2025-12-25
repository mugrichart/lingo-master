import { env } from '@/env'

type FetchTopicsQuery = {
    parent?: string, // parent topic
    creator?: string, // creator id
    myLearning?: string, // topic learning data for this user
    language?: string,
}

import { Topic, Word, TopicSuggestion, WordSuggestion, ConvoSuggestion, Convo, PracticeBook } from '@/lib/definitions'
import { cookies } from 'next/headers'

export async function fetchTopics(query: FetchTopicsQuery = {}): Promise<{ topics: Topic[] }> {
    try {
        const queryParams = new URLSearchParams(query).toString()
        const response = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/topics?${queryParams}`, {
            method: 'GET',
            headers: { 
                'content-type': 'application/json',
            },
        })
        
        return response.json()
    } catch (error) {
        console.error(error)
        throw new Error('Error fetching Topics')
    }
}

export async function fetchTopicByID(id: string): Promise<{ topic: Topic }> {
    try {
        const response = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/topics/${id}`, {
            method: 'GET',
            headers: { 
                'content-type': 'application/json',
            },
        })
        
        return response.json()
    } catch (error) {
        console.error(error)
        throw new Error('Error fetching The topic')
    }
}

export async function fetchWords(topicID: string): Promise<{ words: Word[]}> {
    try {
        const { topic } = await fetchTopicByID(topicID)
        const response = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/words?words=${topic.words}`, {
            method: 'GET',
            headers: { 
                'content-type': 'application/json',
            },
        })
        return response.json()
    } catch (error) {
        console.error(error)
        throw new Error('Error fetching words')
    }
}

export async function fetchConvos(topicID: string): Promise<{ convos: any[]}> {
    try {
        const response = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/conversations?topic=${topicID}`, {
            method: 'GET',
            headers: { 
                'content-type': 'application/json',
            },
        })
        return response.json()
    } catch (error) {
        console.error(error)
        throw new Error('Error fetching convos')
    }
}

export async function fetchTopicSuggestions(topic: Topic): Promise<{ suggestions: TopicSuggestion[]}> {
    try {
        const { topics } = await fetchTopics({ parent: topic?._id })
        // console.log('Existing subtopics:', topics.map(t => t.name))
        const response = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/topics/suggestions?topic=${topic?.name}&excluded=${topics?.map(t => t.name).join(',')}`, {
            method: 'GET',
            headers: { 
                'content-type': 'application/json',
            },
        })
        return response.json()
    } catch (error) {
        console.error(error)
        throw new Error('Error fetching topic suggestions')
    }
}

export async function fetchWordSuggestions(topic: Topic): Promise<{ suggestions: WordSuggestion[]}> {
    try {
        const { words } = topic.words?.length ? await fetchWords(topic._id) : { words: [] }
        console.log('Existing words:', words, topic._id)
        const response = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/words/suggestions?topic=${topic.name}&excluded=${words.map(w => w.word).join(',')}`, {
            method: 'GET',
            headers: { 
                'content-type': 'application/json',
            },
        })
        return response.json()
    } catch (error) {
        console.error(error)
        throw new Error('Error fetching word suggestions')
    }
}

export async function expandWordSuggestion(wordSuggestion: WordSuggestion): Promise<{ detailedSuggestion: Omit<Word, '_id' >}> {
    try {
        const response = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/words/suggestions/expand`, {
            method: 'POST',
            headers: { 
                'content-type': 'application/json',
            },
            body: JSON.stringify(wordSuggestion)
        })
        
        const { word: detailedSuggestion } = await response.json()
        return { detailedSuggestion }
        
    } catch (error) {
        console.error(error)
        throw new Error('Error expanding word suggestion')
    }
}

export async function fetchConvoSuggestions(topic: Topic, words: Word[]): Promise<{ suggestions: ConvoSuggestion[]}> {
    try {
        const response = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/conversations/suggestions?topic=${topic.name}&words=${words.map(w => w.word).join(',')}`, {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
            },
        })
        return response.json()
    } catch (error) {
        console.error(error)
        throw new Error('Error fetching conversation suggestions')
    }
}

export async function expandConvoSuggestion(topic: string, convoSuggestion: ConvoSuggestion): Promise<{ detailedSuggestion: Convo}> {
    try {
        const response = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/conversations/suggestions/expand`, {
            method: 'POST',
            headers: { 
                'content-type': 'application/json',
            },
            body: JSON.stringify({ topic, convoSuggestion })
        })
        
        const { detailedSuggestion } = await response.json()
        return { detailedSuggestion }
        
    } catch (error) {
        console.error(error)
        throw new Error('Error expanding conversation suggestion')
    }
}

export async function fetchPracticeBooks(): Promise<{ books: PracticeBook[], practiceTracking: { user: string, score: number} }> {
    const sessionToken = (await cookies()).get("sessionToken")?.value
    try {
        const response = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/practice-with-books`, {
            headers: {
                "content-type": "application/json",
                "Authorization": `Bearer ${sessionToken}`
            }
        })
        return response.json()
    } catch (error) {
        console.error(error)
        throw new Error("Error fetching practice books")
    }
}