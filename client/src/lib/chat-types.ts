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
  /** actor id, or 'me' for the current user */
  senderId: string
  text: string
  timestamp: string // ISO
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
  /** the group name — this is the topic itself (e.g. "Quantum Physics") */
  title: string
  /** the topic this group is built around */
  topic: string
  /** what this group is about: the topic and the kinds of stories told in it */
  description: string
  /** the individual stories/plots playing out inside this topic group */
  plots: string[]
  /** group/avatar image for the topic group */
  avatar: string
  members: ChatActor[]
  messages: ChatMessage[]
  unreadCount: number
}

export type Chat = DirectChat | PlotChat

/** Maps a backend Character to the DirectChat shape used by the chat UI. */
import type { Character } from './definitions'

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
