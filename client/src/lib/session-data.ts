
import { cookies } from 'next/headers'

export async function fetchUserProfile() {
    try {
        const sessionToken = (await cookies()).get('sessionToken')?.value

        const response = await fetch('http://localhost:3500/api/v1/auth/profile', {
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