import { env } from '@/env'


import { Topic, Word, ConvoSuggestion, Conversation } from '@/lib/definitions'





export async function expandConvoSuggestion(topic: string, convoSuggestion: ConvoSuggestion): Promise<{ detailedSuggestion: Conversation}> {
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

