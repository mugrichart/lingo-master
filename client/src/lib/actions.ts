'use server'
import { z } from 'zod'
import { env } from "@/env"

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { fetchWords } from './data'
import { handleBlanksGen } from './utils'

const SignupFormSchema = z.object({
    username: z.string(),
    email: z.email(),
    password: z.string()
})

const LoginFormSchema = SignupFormSchema.omit({ username: true })

export async function login(formData: FormData) {
    const { email, password } = LoginFormSchema.parse({
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

const CreateTopicSchema = z.object({
    name: z.string(),
    language: z.string()
})


export async function createTopic(parentTopicID: string | null, prevState: any, formData: FormData) {
    const { name, language } = CreateTopicSchema.parse({
        name: formData.get("name"),
        language: formData.get("language")
    });

    try {
        const sessionToken = (await cookies()).get('sessionToken')?.value;

        const response = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/topics`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${sessionToken}`
            },
            body: JSON.stringify({ name, language, parent: parentTopicID })
        });

        if (!response.ok) {
            return "Failed to create topic."; // This becomes your errorMessage
        }

        revalidatePath('/topics');
        return undefined; // Success case
        
    } catch (error) {
        console.error(error);
        return "An error occurred."; // This becomes your errorMessage
    }
}
export async function editTopic(topicID: string, prevState: any, formData: FormData) {
    const update = CreateTopicSchema.parse({
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

const CreateWordSchema = z.object({
    word: z.string(),
    type: z.string(),
    style: z.string(),
    meaning: z.string(),
    example: z.string(),
    synonym: z.string(),
    antonym: z.string()
})

const PracticeBookSchema = z.object({
    title: z.string(),
    author: z.string(),
    pageCount: z.coerce.number().positive(),
    startingPage: z.coerce.number().positive(),
    endingPage: z.coerce.number().positive(),
    bookFile: z.file(),
    bookCover: z.file()
})

export async function createWord(topicID: string, prevState: any, formData: FormData) {
    
    const { word, type, style, meaning, example, synonym, antonym } = CreateWordSchema.parse({
        word: formData.get('word'),
        type: formData.get('type'),
        style: formData.get('language style'),
        meaning: formData.get('meaning'),
        example: formData.get('example'),
        synonym: formData.get('synonym'),
        antonym: formData.get('antonym')
    })

    try {
        await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/words`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({ word, type, 'language style': style, meaning, example, synonym, antonym, topicID: topicID })
        })
    } catch (error) {
        console.error(error)
        throw new Error('Error creating word')
    }

    revalidatePath('/topics');
    return undefined; // Success case
}

// Simple server action to receive a conversation form and read its FormData.
export async function createConversation(topicID: string | null, prevState: any, formData: FormData) {
    // Read simple fields
    const title = formData.get('title')?.toString() ?? ''
    const description = formData.get('description')?.toString() ?? ''

    // Read repeated fields
    const characters = formData.getAll('characters').map((v) => v?.toString() ?? '')
    const lineTexts = formData.getAll('line_text').map((v) => v?.toString() ?? '')
    const lineActors = formData.getAll('line_actor').map((v) => Number(v))

    const { words } = await fetchWords(topicID || '')

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
        topic: topicID,
        title,
        description,
        characters,
        lines,
    }

    const sessionToken = (await cookies()).get('sessionToken')?.value

    await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/conversations`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`
        },
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