import { ChatActor, Chat, ChatMessage } from './chat-types'

// Stock avatar images (placeholder service)
const img = (seed: string) => `https://picsum.photos/seed/${seed}/200/200`

const actors: Record<string, ChatActor> = {
  marcus: {
    id: 'marcus',
    name: 'Marcus Hale',
    description: 'Debate coach · loves precise vocabulary',
    bio: 'A former policy debater turned language coach. Marcus pushes you to justify every claim with the exact right word, and he never lets a vague argument slide.',
    avatar: img('marcus'),
    online: true
  },
  amara: {
    id: 'amara',
    name: 'Amara Osei',
    description: 'Travel writer · casual storyteller',
    bio: 'Amara has backpacked through 40 countries and writes about all of them. She chats in idioms, slang and colourful expressions — great for informal fluency.',
    avatar: img('amara'),
    online: true
  },
  dr_lin: {
    id: 'dr_lin',
    name: 'Dr. Evelyn Lin',
    description: 'Quantum researcher · formal & technical',
    bio: 'A physicist who insists on scientific precision. Expect jargon, careful definitions and long explanatory sentences. Perfect for academic English practice.',
    avatar: img('evelyn'),
    online: false
  },
  sofia: {
    id: 'sofia',
    name: 'Sofia Marino',
    description: 'Chef & restaurateur · warm and encouraging',
    bio: 'Sofia runs a family trattoria and talks about food, hospitality and culture. She is patient, gently corrects you, and always steers the conversation back to flavour.',
    avatar: img('sofia'),
    online: true
  },
  kenji: {
    id: 'kenji',
    name: 'Kenji Tanaka',
    description: 'Startup founder · fast-paced business speak',
    bio: 'Kenji lives in pitch decks and stand-up meetings. He uses business idioms, action verbs and concise phrasing. Good for professional and workplace vocabulary.',
    avatar: img('kenji'),
    online: false
  }
}

const now = Date.now()
const mins = (m: number) => new Date(now - m * 60_000).toISOString()

const msg = (id: string, chatId: string, senderId: string, text: string, minutesAgo: number, status?: ChatMessage['status']): ChatMessage =>
  ({ id, chatId, senderId, text, timestamp: mins(minutesAgo), status })

export const mockChats: Chat[] = []


export const currentUserAvatar = img('current-user')

/** Formats an ISO timestamp into WhatsApp-style chat times. */
export function formatChatTime(iso: string): string {
  const date = new Date(iso)
  const nowDate = new Date()
  const sameDay = date.toDateString() === nowDate.toDateString()
  const yesterday = new Date(nowDate)
  yesterday.setDate(yesterday.getDate() - 1)

  if (sameDay) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}
