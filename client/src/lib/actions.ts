'use server'
import { z } from 'zod'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

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

    const response = await fetch('http://localhost:3500/api/v1/auth/login', {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })

    // if (!response.ok) {
    //     return { error: "Invalid credentials"}
    // }

    const data = await response.json()
    const authToken = data.token; // JWT Token

    (await cookies()).set('sessionToken', authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
    })

    redirect('/solo-player/topics')

}

const CreateTopicSchema = z.object({
    name: z.string(),
    language: z.string()
})

export async function createTopic(parentTopicID: string, formData: FormData) {
    const { name, language } = CreateTopicSchema.parse({
        name: formData.get("name"),
        language: formData.get("language")
    })

    try {
        const sessionToken = (await cookies()).get('sessionToken')?.value

        await fetch("http://localhost:3500/api/v1/topics", {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${sessionToken}`
            },
            body: JSON.stringify({ name, language, parent: parentTopicID })
        })

        
    } catch (error) {
        console.error(error)
        throw new Error('Error creating topic')
    }

    redirect(parentTopicID ? `/solo-player/topics/${parentTopicID}` : '/solo-player/topics')
}

export async function createWord(topicID: string, formData: FormData) {
    console.log(formData, topicID)
}