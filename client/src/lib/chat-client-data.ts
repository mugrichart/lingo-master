import z from 'zod'
import { apiRequest } from './api-client'
import { CharacterSchema, CharacterMessageSchema } from './api-schemas'
import type { Character, CharacterMessage } from './definitions'

/**
 * Client-safe character/chat fetchers (no next/headers).
 * Auth relies on the session cookie being sent with same-site requests;
 * used only from client components in the chats UI.
 */
const headers = { "content-type": "application/json" }

export async function fetchCharactersClient(): Promise<Character[]> {
    try {
        return await apiRequest(`/characters`, z.array(CharacterSchema), { method: 'GET', headers })
    } catch (error) {
        console.error(error)
        return []
    }
}

export async function fetchCharacterClient(id: string): Promise<Character | null> {
    try {
        return await apiRequest(`/characters/${id}`, CharacterSchema, { method: 'GET', headers })
    } catch (error) {
        console.error(error)
        return null
    }
}

export async function fetchCharacterMessagesClient(characterId: string): Promise<CharacterMessage[]> {
    try {
        return await apiRequest(`/characters/${characterId}/messages`, z.array(CharacterMessageSchema), { method: 'GET', headers })
    } catch (error) {
        console.error(error)
        return []
    }
}
