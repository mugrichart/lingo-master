import { Topic, Word, TopicSuggestion, WordSuggestion, ConvoSuggestion, Conversation, ExpandedSuggestion } from '@/lib/definitions'

import { cookies } from 'next/headers'
import { PracticeBook, PracticeBookPage } from './definitions'


import z, { number } from 'zod';
import { apiRequest } from './api-client'
import { WordSchema, UserSchema, TopicSchema, ConversationSchema, PracticeBookSchema, PracticeBookPageSchema } from './api-schemas'


type FetchTopicsQuery = {
    parent?: string | null, // parent topic
    creator?: string, // creator id
    myLearning?: string, // topic learning data for this user
    language?: string,
}



// ---------- User related --------------
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


// ============= Topics related ====================




export async function fetchTopics(query: FetchTopicsQuery = {}): Promise<Topic[]> {
    const headers = await getHeaders()
    try {
        const queryParams = new URLSearchParams(query as any).toString()
        console.log(queryParams, 'queryParams', query)
        return apiRequest(`/topics?${queryParams}`, z.array(TopicSchema),  {
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

// =================== Words realted ============================


export async function fetchWords(topicID?: string, search?: string): Promise<Word[]> {
    const headers = await getHeaders()

    try {
        return apiRequest(`/words?topic=${topicID}&search=${search}`, 
            z.array(WordSchema),
            {
            method: 'GET',
            headers,
        })
    } catch (error) {
        console.error(error)
        throw new Error('Error fetching words')
    }
}

export async function fetchWordSuggestions(topic: Topic): Promise<{ words: WordSuggestion[]}> {
    const headers = await getHeaders()

    try {
        const words: string[] = []//topic.words?.length ? await fetchWords(topic._id) : { words: [] }
        return apiRequest(`/words/suggestions`,
            z.object({ words: z.array(WordSchema.pick({word: true, example: true}))}),
            {
                method: 'POST',
                headers,
                body: JSON.stringify({ topic: topic?.name, alreadyExistingWords: words})
            },
        )
    } catch (error) {
        console.error(error)
        throw new Error('Error fetching word suggestions')
    }
}

export async function expandWordSuggestion(wordSuggestion: WordSuggestion): Promise<Omit<Word, '_id' | 'blanked example' | 'language' | 'related words' >> {
    'use server'
    const headers = await getHeaders()

    try {
        return apiRequest(`/words/suggestions/expand`, 
            WordSchema.omit({ "blanked example": true, _id: true, language: true, "related words": true}),
            {
            method: 'POST',
            headers,
            body: JSON.stringify(wordSuggestion)
        })
        
    } catch (error) {
        console.error(error)
        throw new Error('Error expanding word suggestion')
    }
}

// =================== Conversations related ===========================
export async function fetchConversations(topicId: string): Promise<Conversation[]> {
    const headers = await getHeaders()
    try {
        return apiRequest(`/conversations?topicId=${topicId}`, 
            z.array(ConversationSchema),
            {
            method: 'GET',
            headers
        })
    } catch (error) {
        console.error(error)
        throw new Error('Error fetching convos')
    }
}

export async function fetchConversationSuggestions(topicId: string): Promise<{ conversations: ConvoSuggestion[]}> {
    const headers = await getHeaders()
    try {
        return apiRequest(`/conversations/suggestions?topicId=${topicId}`, 
            z.object({ conversations: z.array(
                ConversationSchema.
                    pick({ title: true, description: true })
                    .extend({ suggestedWords: z.array(z.string())})
            )}),
            {
            method: 'GET',
            headers
        })
    } catch (error) {
        console.error(error)
        throw new Error('Error fetching conversation suggestions')
    }
}

export async function expandConversationSuggestion(topic: string, convoSuggestion: ConvoSuggestion): Promise<ExpandedSuggestion> 
{
    'use server'
    const headers = await getHeaders()
    try {
        return apiRequest(`/conversations/suggestions/expansion`, 
            ConversationSchema
                .omit({ _id: true, isAiGenerated: true})
                .extend({ lines: z.array(z.object({
                    actor: z.number(),
                    text: z.string()
                }))})
            ,
            {
                method: 'POST',
                headers,
                body: JSON.stringify({ topic, ...convoSuggestion })
            }
        )
        
    } catch (error) {
        console.error(error)
        throw new Error('Error expanding conversation suggestion')
    }
}

// =================== Books related ===================================
export async function fetchPracticeBooks(): Promise<PracticeBook[]> {
    const headers = await getHeaders()
    try {
        return apiRequest(`/books`, 
            z.array(PracticeBookSchema.extend({_id: z.string(), pdfUrl: z.url(), coverUrl: z.url()})),
            { headers }
        )
    } catch (error) {
        console.error(error)
        throw new Error("Error fetching practice books")
    }
}

export async function fetchPracticeBookPage(bookId: string, pageNumber?: number): Promise<{ pageContent: PracticeBookPage, pageNumber: number} | null> {

    const queryParams = new URLSearchParams({ bookId, pageNumber: (pageNumber ?? 0).toString() })
    const headers = await getHeaders()

    try {        
        return await apiRequest(`/books/practice/page?${queryParams}`, 
            PracticeBookPageSchema.nullable(),
            { headers}
        )
    } catch (error) {
        console.error(error)
        // throw new Error("Error fetching practice book page")
        return null
    }
}

export async function createPracticeBookPage(bookId: string, pageNumber?: number): Promise<{ pageContent: PracticeBookPage, pageNumber: number} | null> {

    const headers = await getHeaders()

    try {        
        return apiRequest(`/books/practice/page`, 
            PracticeBookPageSchema.nullable(),
            { method: 'Post', headers, body: JSON.stringify({ bookId, pageNumber })}
        )
    } catch (error) {
        console.error(error)
        throw new Error("Error fetching practice book page")
    }
}

export async function fetchPracticePlan(bookId: string): Promise<{ bookId: string, user: string, cursorAt: number, pages: string[]} | null> {

    const queryParams = new URLSearchParams({ bookId })
    const headers = await getHeaders()
    try {        
        return await apiRequest(`/books/practice/plan?${queryParams.toString()}`, 
            z.object({bookId: z.string(), user: z.string(), cursorAt: z.number(), pages: z.array(z.string())}).nullable(),
            { headers}
        )
    } catch (error) {
        console.error(error)
        // throw new Error("Error fetching practice book page")
        return null
    }
}

export async function createPracticePlan(bookId: string): Promise<{ bookId: string, user: string, cursorAt: number, pages: string[]} | null> {

    const headers = await getHeaders()

    try {        
        return apiRequest(`/books/practice/plan`, 
            z.object({bookId: z.string(), user: z.string(), cursorAt: z.number(), pages: z.array(z.string())}).nullable(),
            { method: 'Post', headers, body: JSON.stringify({ bookId })}
        )
    } catch (error) {
        console.error(error)
        throw new Error("Error fetching practice book page")
    }
}

export async function fetchPracticeTracking(): Promise<{ _id: string, user: string, score: number} | null> {
    const headers = await getHeaders()
    try {
        return apiRequest('/books/practice/tracking', 
            z.object({ _id: z.string(), user: z.string(), score: z.number()}).nullable(), 
            { headers }
        )
    } catch (error) {
        console.error(error)
        throw new Error("Error fetching practice tracking data")
    }
}

export async function createPracticeTracking(): Promise<{ _id: string, user: string, score: number}> {
    const headers = await getHeaders()
    try {
        return apiRequest('/books/practice/tracking', 
            z.object({ _id: z.string(), user: z.string(), score: z.number()}), 
            { method: 'POST', headers }
        )
    } catch (error) {
        console.error(error)
        throw new Error("Error fetching practice tracking data")
    }
}

export async function getHeaders() {
    const sessionToken = (await cookies()).get("sessionToken")?.value
    return {
        "content-type": "application/json",
        "Authorization": `Bearer ${sessionToken}`
    }
}