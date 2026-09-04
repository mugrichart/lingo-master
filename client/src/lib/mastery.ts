import z from 'zod'
import { apiRequest } from './api-client'
import { getHeaders } from './data'

/**
 * Aggregated mastery for topic cards (recursive over subtopics).
 * null means nothing testable/tested anywhere in the branch.
 * Server-only (uses next/headers via getHeaders) — consumed by server
 * components, never imported into client bundles.
 */
export async function fetchTopicMasteryBadge(topicId: string): Promise<number | null> {
    const headers = await getHeaders()
    try {
        const data = await apiRequest(`/topics/${topicId}/mastery`,
            z.object({ mastery: z.number().nullable() }),
            { method: 'GET', headers }
        )
        return data?.mastery ?? null
    } catch (error) {
        console.error(error)
        return null
    }
}
