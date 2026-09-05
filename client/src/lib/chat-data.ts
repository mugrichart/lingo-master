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

export const mockChats: Chat[] = [
  {
    kind: 'plot',
    id: 'plot-quantum',
    title: 'Quantum Physics',
    topic: 'Quantum Physics',
    description: 'A group where stories about quantum research, experiments and scientific breakthroughs play out. Multiple plots run here, all orbiting quantum physics — so you keep practising the same technical vocabulary in fresh scenarios.',
    plots: ['The Schroedinger Heist', 'The Entangled Alibi', 'Decoherence at Dawn'],
    avatar: img('quantum-plot'),
    members: [actors.dr_lin, actors.marcus, actors.kenji],
    unreadCount: 2,
    messages: [
      msg('q1', 'plot-quantum', 'dr_lin', 'The coherence window is closing. If we do not isolate the qubit array, the superposition will decohere.', 34),
      msg('q2', 'plot-quantum', 'marcus', 'Explain it to me like I am on the review board. What exactly did they steal?', 32),
      msg('q3', 'plot-quantum', 'dr_lin', 'A photonic entangler. Without it, our whole encryption scheme is theoretical.', 30),
      msg('q4', 'plot-quantum', 'kenji', 'So we pivot. We track the thermal signature instead of the device itself.', 27),
      msg('q5', 'plot-quantum', 'dr_lin', 'Precisely. And we need to articulate the risk in plain terms for the investors.', 25),
    ]
  },
  {
    kind: 'plot',
    id: 'plot-food',
    title: 'Food & Hospitality',
    topic: 'Food & Hospitality',
    description: 'Stories set in kitchens, restaurants and dining rooms. Several plots run in this group — openings, disasters, critics and celebrations — all rich with food and hospitality expressions.',
    plots: ['Opening Night at the Trattoria', 'The Health Inspector', 'A Michelin Surprise'],
    avatar: img('food-plot'),
    members: [actors.sofia, actors.amara, actors.kenji],
    unreadCount: 0,
    messages: [
      msg('f1', 'plot-food', 'sofia', 'The supplier delivered basil instead of oregano. We improvise, yes?', 130),
      msg('f2', 'plot-food', 'amara', 'This is exactly like the night market in Bangkok. You adapt or you close.', 125),
      msg('f3', 'plot-food', 'me', 'What is the fallback for the sauce then?', 120, 'read'),
      msg('f4', 'plot-food', 'sofia', 'We pivot to a basil pesto. Kenji, you handle the front-of-house announcements.', 118),
      msg('f5', 'plot-food', 'kenji', 'On it. I will comp the first round of drinks and manage expectations.', 115),
    ]
  }
]


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
