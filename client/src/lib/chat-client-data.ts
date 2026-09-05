import z from 'zod'
import { apiRequest } from './api-client'
import { CharacterSchema, CharacterMessageSchema } from './api-schemas'
import type { Character, CharacterMessage } from './definitions'

/**
 * Client-safe character/chat fetchers.
 * These call local Next.js Route Handler proxies (/api/characters/*)
 * which run server-side, read the httpOnly session cookie, and forward
 * the request to the backend with an Authorization header.
 */
const headers = { 'content-type': 'application/json' }

export async function fetchCharactersClient(): Promise<Character[]> {
    try {
        return await apiRequest(`/api/characters`, z.array(CharacterSchema), { method: 'GET', headers })
    } catch (error) {
        console.error(error)
        return []
    }
}

export async function fetchCharacterClient(id: string): Promise<Character | null> {
    try {
        return await apiRequest(`/api/characters/${id}`, CharacterSchema, { method: 'GET', headers })
    } catch (error) {
        console.error(error)
        return null
    }
}

export async function fetchCharacterMessagesClient(characterId: string): Promise<CharacterMessage[]> {
    try {
        return await apiRequest(`/api/characters/${characterId}/messages`, z.array(CharacterMessageSchema), { method: 'GET', headers })
    } catch (error) {
        console.error(error)
        return []
    }
}

