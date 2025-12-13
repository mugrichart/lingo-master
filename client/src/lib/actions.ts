'use server'
import { z } from 'zod'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

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

    redirect('/topics')

}