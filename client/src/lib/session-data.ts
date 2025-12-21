
import { cookies } from 'next/headers'
import { env } from '@/env'

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