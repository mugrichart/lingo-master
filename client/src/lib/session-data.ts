
import { cookies } from 'next/headers'
import { env } from '@/env'
import { PracticeBookPage } from './definitions'

export async function fetchUserProfile() {
    try {
        const sessionToken = (await cookies()).get('sessionToken')?.value

        const response = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/auth/profile`, {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${sessionToken}`
            },
        })

        const data = await response.json()

        return { name: data.username, email: data.email, avatar: "" }

    } catch (error) {
        console.error(error)
        throw new Error('Error fetching user')
    }
}


export async function fetchPracticeBookPage(bookID: string, page?: number): Promise<{ page: PracticeBookPage, cursorAt: number}> {

    const queryParams = new URLSearchParams({ bookID, page: page ?? "" })

    try {
        const sessionToken = (await cookies()).get('sessionToken')?.value
        
        const response = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/practice-with-books/practice?${queryParams}`, {
            headers: {
                "content-type": "application/json",
                "Authorization": `Bearer ${sessionToken}`
            }
        })
        return response.json()
    } catch (error) {
        console.error(error)
        throw new Error("Error fetching practice book page")
    }
}

export async function fetchPracticeTracking(): Promise<{ practiceTracking: { user: string, score: number} }>{
    const sessionToken = (await cookies()).get('sessionToken')?.value
    try {
        const response = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/practice-with-books/tracking`, {
            headers: {
                "content-type": "application/json",
                "Authorization": `Bearer ${sessionToken}`
            }
        })

        return response.json()
    } catch (error) {
        console.error(error)
        throw new Error("Error fetching practice tracking")
    }
}