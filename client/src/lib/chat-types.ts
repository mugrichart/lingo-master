import type { Character, MyLearningTopic, Story } from './definitions'

export type ChatActor = {
  id: string
  name: string
  /** one-line role/persona shown under the name and on the profile */
  description: string
  /** longer bio for the profile panel */
  bio: string
  avatar: string
  online: boolean
}

export type ChatMessage = {
  id: string
  chatId: string
  /** actor id, 'me' for the current user, or 'narrator' for DM */
  senderId: string
  senderName?: string
  text: string
  timestamp: string // ISO
  kind?: 'user' | 'actor' | 'narration' | 'system'
  status?: 'sent' | 'delivered' | 'read' // only meaningful for own messages
}

export type DirectChat = {
  kind: 'direct'
  id: string
  actor: ChatActor
  messages: ChatMessage[]
  unreadCount: number
}

export type PlotChat = {
  kind: 'plot'
  id: string
  /** the topic ID */
  topicId: string
  /** the group name — this is the topic itself (e.g. "Quantum Physics") */
  title: string
  /** the topic this group is built around */
  topic: string
  /** what this group is about */
  description: string
  /** the list of stories in this topic group */
  stories: Story[]
  /** currently selected/active story in this topic group */
  activeStoryId?: string
  /** group avatar */
  avatar: string
  messages: ChatMessage[]
  unreadCount: number
}

export type Chat = DirectChat | PlotChat

/** Maps a backend Character to the DirectChat shape used by the chat UI. */
export const characterToDirectChat = (c: Character): DirectChat => ({
  kind: 'direct',
  id: c._id,
  unreadCount: 0,
  messages: [],
  actor: {
    id: c._id,
    name: c.name || 'New contact',
    description: c.status === 'pending' ? 'creating…' : c.description,
    bio: c.bio,
    avatar: c.avatar || '',
    online: c.status === 'ready'
  }
})

/** Stock avatar for topic groups */
const img = (seed: string) => `https://picsum.photos/seed/${seed}/200/200`

/** Converts a learned topic into a PlotChat topic group. */
export const topicToGroupChat = (t: MyLearningTopic): PlotChat => ({
  kind: 'plot',
  id: `group-${t.topic._id}`,
  topicId: t.topic._id,
  title: t.topic.name,
  topic: t.topic.name,
  description: `Interactive stories exploring ${t.topic.name}. Launch a scenario with /start-story to practice and naturally weave your learned vocabulary into real dialogue.`,
  stories: [],
  avatar: img(`topic-${t.topic._id}`),
  messages: [],
  unreadCount: 0,
})
