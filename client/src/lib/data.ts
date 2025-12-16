
type FetchTopicsQuery = {
    parent?: string, // parent topic
    creator?: string, // creator id
    myLearning?: string, // topic learning data for this user
    language?: string,
}

import { Topic, Word } from '@/lib/definitions'

export async function fetchTopics(query: FetchTopicsQuery = {}): Promise<{ topics: Topic[] }> {
    try {
        const queryParams = new URLSearchParams(query).toString()
        const response = await fetch(`http://localhost:3500/api/v1/topics?${queryParams}`, {
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
        const response = await fetch(`http://localhost:3500/api/v1/topics/${id}`, {
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
        const response = await fetch(`http://localhost:3500/api/v1/words?words=${topic.words}`, {
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
        const response = await fetch(`http://localhost:3500/api/v1/conversations?topic=${topicID}`, {
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