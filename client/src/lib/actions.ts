'use server'
import { z } from 'zod'
import { env } from "@/env"

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { fetchWords } from './data'
import { handleBlanksGen } from './utils'
import { AuthFormSchema, ConversationSchema, PracticeBookSchema, TopicSchema, WordSchema } from './api-schemas'
import { apiRequest } from './api-client'
import { getHeaders } from './data'


export async function login(formData: FormData) {
    const { email, password } = AuthFormSchema.omit({ username: true }).parse({
        email: formData.get('email'),
        password: formData.get('password')
    })

    try {
        const response = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })
        
        if (!response.ok) {
            throw new Error("Invalid credentials")
        }

        const data = await response.json()
        const authToken = data.token; // JWT Token

        (await cookies()).set('sessionToken', authToken, {
            httpOnly: true,
            secure: env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7,
            path: '/'
        })
    } catch (error) {
        console.log(error)
        throw new Error("Error logging in")
    }
    redirect('/topics')
}


export async function createTopic(parentTopicID: string | null, prevState: any, formData: FormData) {
    const { name, language } = TopicSchema.pick({name: true, language: true}).parse({
        name: formData.get("name")?.toString(),
        language: formData.get("language")?.toString()
    });

    try {
        const headers = await getHeaders()

        await apiRequest(`/topics`, 
            TopicSchema, 
            {
                method: 'POST',
                headers,
                body: JSON.stringify({ name, language, parent: parentTopicID })
            }
        )

        revalidatePath('/topics');
        return undefined; // Success case
        
    } catch (error) {
        console.error(error);
        return "An error occurred."; // This becomes your errorMessage
    }
}
export async function editTopic(topicID: string, prevState: any, formData: FormData) {
    const update = TopicSchema.pick({ name: true, language: true}).parse({
        name: formData.get("name"),
        language: formData.get("language")
    });

    try {
        const sessionToken = (await cookies()).get('sessionToken')?.value;

        const response = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/topics/${topicID}`, {
            method: 'PATCH',
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${sessionToken}`
            },
            body: JSON.stringify(update)
        });

        if (!response.ok) {
            return "Failed to update topic."; // This becomes your errorMessage
        }

        
    } catch (error) {
        console.error(error);
        return "An error occurred."; // This becomes your errorMessage
    }

    revalidatePath('/topics');
    redirect(`/topics/${topicID}`);
}



export async function createWord(topicID: string, prevState: any, formData: FormData) {
    
    const validated = WordSchema
                        .pick({ word: true, type: true, "language style": true, meaning: true, example: true, synonym: true, antonym: true})
                        .parse({
                            word: formData.get('word')?.toString(),
                            type: formData.get('type')?.toString(),
                            'language style': formData.get('language style')?.toString(),
                            meaning: formData.get('meaning')?.toString(),
                            example: formData.get('example')?.toString(),
                            synonym: formData.get('synonym')?.toString(),
                            antonym: formData.get('antonym')?.toString()
                        })

    const headers = await getHeaders()

    const blanked = validated.word && validated.example ? handleBlanksGen(validated.example, [validated.word]).blanked : validated.example

    try {
        await apiRequest(`/words`, 
            WordSchema, {
            method: 'POST',
            headers,
            body: JSON.stringify({ ...validated, 'blanked example': blanked, topicID: topicID })
        })
    } catch (error) {
        console.error(error)
        throw new Error('Error creating word')
    }

    revalidatePath('/topics');
    return undefined; // Success case
}

// Simple server action to receive a conversation form and read its FormData.
export async function createConversation(topicId: string | null, prevState: any, formData: FormData) {
    // Read simple fields
    const title = formData.get('title')?.toString() ?? ''
    const description = formData.get('description')?.toString() ?? ''

    // Read repeated fields
    const characters = formData.getAll('characters').map((v) => v?.toString() ?? '')
    const lineTexts = formData.getAll('line_text').map((v) => v?.toString() ?? '')
    const lineActors = formData.getAll('line_actor').map((v) => Number(v))

    const words = await fetchWords(topicId || '')

    // Compose lines by index
    const lines = lineTexts.map((text, i) => {
        const { blanked, usedExpressions } = handleBlanksGen(text, words.map(w => w.word), false)

        return { 
            actor: lineActors[i] ?? 0, 
            text,
            blankedText: blanked,
            usedWords: usedExpressions.filter(w => w)
        }
    })

    const payload = {
        topicId,
        title,
        description,
        characters,
        lines,
    }

    const headers = await getHeaders()

    await apiRequest(`/conversations`, 
        ConversationSchema,
        {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        
    })

    revalidatePath('/topics');
    return undefined; // Success case
}

export async function uploadPracticeBook(formData: FormData) {
    PracticeBookSchema.parse({
        title: formData.get("title"),
        author: formData.get("author"),
        pageCount: formData.get("pageCount"),
        startingPage: formData.get("startingPage"),
        endingPage: formData.get("endingPage"),
        bookFile: formData.get("bookFile"),
        bookCover: formData.get("bookCover")
    })

    const sessionToken = (await cookies()).get("sessionToken")?.value
    
    try {
        const response = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/practice-with-books/upload`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${sessionToken}`
            },
            body: formData
        })

        if (!response.ok) {
            throw new Error("Upload failed")
        }

    } catch (error) {
        console.error(error)
        throw new Error('Error uploading the practice book')
    }
    
    revalidatePath('/practice-with-books')
    redirect('/practice-with-books')
}

export async function updatePracticeTracking(score: number) {
    const sessionToken = (await cookies()).get('sessionToken')?.value
    try {
        const response = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/practice-with-books/tracking`, {
            method: 'POST',
            headers: {
                "content-type": "application/json",
                "Authorization": `Bearer ${sessionToken}`
            },
            body: JSON.stringify({ score })
        })
        return response.json()
    } catch (error) {
        console.error(error)
        throw new Error("Error updating practice tracking")
    }
}