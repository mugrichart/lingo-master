import { env } from '@/env'


import { Topic, Word, ConvoSuggestion, Convo } from '@/lib/definitions'


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

