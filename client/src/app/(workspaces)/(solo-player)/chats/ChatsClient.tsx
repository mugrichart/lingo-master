'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Chat, ChatMessage, characterToDirectChat, PlotChat } from '@/lib/chat-types'
import { ChatListPane } from './components/ChatListPane'
import { ConversationPane } from './components/ConversationPane'
import { ChatInfoPanel } from './components/ChatInfoPanel'
import { MessageSquareText } from 'lucide-react'
import { Character, MyLearningTopic, Story } from '@/lib/definitions'
import {
  fetchCharacterClient,
  fetchCharacterMessagesClient,
  startStoryClient,
  fetchStoriesClient,
  fetchStoryMessagesClient,
  sendStoryMessageClient
} from '@/lib/chat-client-data'
import { sendCharacterMessage, addCharacterExpertise, deleteCharacter } from '@/lib/actions'

const EmptyState = () => (
  <div className="hidden h-full flex-1 flex-col items-center justify-center gap-3 bg-background text-center md:flex">
    <div className="grid size-24 place-items-center rounded-full bg-accent">
      <MessageSquareText className="size-12 text-muted-foreground" />
    </div>
    <h2 className="text-xl font-semibold">Your conversations</h2>
    <p className="max-w-xs text-sm text-muted-foreground">
      Pick a contact to chat with an actor, or open a topic group to play interactive stories and practice vocabulary.
    </p>
  </div>
)

export default function ChatsClient({ initialChats, learnedTopics }: { initialChats: Chat[], learnedTopics: MyLearningTopic[] }) {
  const [chats, setChats] = useState<Chat[]>(initialChats)
  const [active, setActive] = useState<Chat | null>(null)
  const [showInfo, setShowInfo] = useState(false)
  const [sending, setSending] = useState(false)
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const chatsRef = useRef<Chat[]>(chats)

  const isRealCharacter = (chat: Chat): chat is Extract<Chat, { kind: 'direct' }> =>
    chat.kind === 'direct' && !chat.actor.id.startsWith('dm-')

  const isTopicGroup = (chat: Chat): chat is PlotChat => chat.kind === 'plot'

  const selectChat = useCallback(async (chat: Chat) => {
    setActive(chat)
    setShowInfo(false)
    setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unreadCount: 0 } : c))

    if (chat.kind === 'direct' && isRealCharacter(chat)) {
      const msgs = await fetchCharacterMessagesClient(chat.id)
      const mapped: ChatMessage[] = msgs.map(m => ({
        id: m._id,
        chatId: chat.id,
        senderId: m.role === 'user' ? 'me' : (chat.kind === 'direct' ? chat.actor.id : ''),
        text: m.text,
        timestamp: m.createdAt ?? new Date().toISOString(),
        kind: m.role === 'user' ? 'user' : 'actor',
        status: 'read'
      }))
      setChats(prev => prev.map(c => c.id === chat.id ? { ...c, messages: mapped } : c))
      setActive(prev => prev && prev.id === chat.id ? { ...prev, messages: mapped } : prev)
    } else if (chat.kind === 'plot') {
      // Fetch stories for this topic
      const stories = await fetchStoriesClient(chat.topicId)
      const activeStory = stories[0] ?? null
      let storyMsgs: ChatMessage[] = []

      if (activeStory) {
        const msgs = await fetchStoryMessagesClient(activeStory._id)
        storyMsgs = msgs.map(m => ({
          id: m._id,
          chatId: chat.id,
          senderId: m.senderId,
          senderName: m.senderName,
          text: m.text,
          timestamp: m.createdAt ?? new Date().toISOString(),
          kind: m.kind,
          status: 'read',
        }))
      }

      const updatedPlot: PlotChat = {
        ...chat,
        stories,
        activeStoryId: activeStory?._id,
        messages: storyMsgs,
      }

      setChats(prev => prev.map(c => c.id === chat.id ? updatedPlot : c))
      setActive(prev => prev && prev.id === chat.id ? updatedPlot : prev)
    }
  }, [])

  const selectStoryInGroup = useCallback(async (storyId: string) => {
    if (!active || active.kind !== 'plot') return
    const msgs = await fetchStoryMessagesClient(storyId)
    const storyMsgs: ChatMessage[] = msgs.map(m => ({
      id: m._id,
      chatId: active.id,
      senderId: m.senderId,
      senderName: m.senderName,
      text: m.text,
      timestamp: m.createdAt ?? new Date().toISOString(),
      kind: m.kind,
      status: 'read',
    }))

    const updatedPlot: PlotChat = {
      ...active,
      activeStoryId: storyId,
      messages: storyMsgs,
    }

    setChats(prev => prev.map(c => c.id === active.id ? updatedPlot : c))
    setActive(updatedPlot)
  }, [active])

  const upsertCharacterChat = useCallback((character: Character) => {
    const chat = characterToDirectChat(character)
    setChats(prev => {
      const existing = prev.find(c => c.id === chat.id)
      if (existing) return prev.map(c => c.id === chat.id ? { ...chat, messages: c.messages } : c)
      return [chat, ...prev]
    })
    setActive(prev => (prev && prev.id === chat.id) ? { ...chat, messages: prev.messages } : prev)
  }, [])

  // poll pending characters until ready
  useEffect(() => {
    chatsRef.current = chats
    const hasPending = chatsRef.current.some(c => c.kind === 'direct' && isRealCharacter(c) && c.actor.description === 'creating…')
    if (!hasPending) {
      if (pollTimer.current) { clearInterval(pollTimer.current); pollTimer.current = null }
      return
    }
    if (pollTimer.current) return
    pollTimer.current = setInterval(async () => {
      const pending = chatsRef.current.filter(c => c.kind === 'direct' && isRealCharacter(c) && c.actor.description === 'creating…')
      if (!pending.length) {
        if (pollTimer.current) { clearInterval(pollTimer.current); pollTimer.current = null }
        return
      }
      for (const c of pending) {
        const updated = await fetchCharacterClient(c.id)
        if (updated && updated.status !== 'pending') upsertCharacterChat(updated)
      }
    }, 4000)
    return () => { if (pollTimer.current) { clearInterval(pollTimer.current); pollTimer.current = null } }
  }, [chats, upsertCharacterChat])

  const activeActorId = active?.kind === 'direct' ? active.actor.id : ''

  const sendMessage = async (text: string) => {
    if (!active || sending) return

    const localMsg: ChatMessage = {
      id: `local-${Date.now()}`,
      chatId: active.id,
      senderId: 'me',
      senderName: 'You',
      text,
      timestamp: new Date().toISOString(),
      kind: 'user',
      status: 'sent'
    }
    const appendUser = (c: Chat) => c.id === active.id ? { ...c, messages: [...c.messages, localMsg] } : c
    setChats(prev => prev.map(appendUser))
    setActive(prev => prev ? appendUser(prev) : prev)

    if (active.kind === 'direct' && isRealCharacter(active)) {
      setSending(true)
      try {
        const { reply } = await sendCharacterMessage(active.id, text)
        const replyMsg: ChatMessage = {
          id: `reply-${Date.now()}`,
          chatId: active.id,
          senderId: activeActorId,
          text: reply,
          timestamp: new Date().toISOString(),
          kind: 'actor'
        }
        const appendReply = (c: Chat) => c.id === active.id ? { ...c, messages: [...c.messages, replyMsg] } : c
        setChats(prev => prev.map(appendReply))
        setActive(prev => prev ? appendReply(prev) : prev)
      } catch (e) {
        console.error(e)
      } finally {
        setSending(false)
      }
    } else if (active.kind === 'plot') {
      const activeStoryId = active.activeStoryId
      if (!activeStoryId) return

      setSending(true)
      try {
        const res = await sendStoryMessageClient(activeStoryId, text)
        if (res) {
          // Convert returned messages (narration / actor reply)
          const newStoryMessages: ChatMessage[] = res.messages.filter(m => m.kind !== 'user').map(m => ({
            id: m._id,
            chatId: active.id,
            senderId: m.senderId,
            senderName: m.senderName,
            text: m.text,
            timestamp: m.createdAt ?? new Date().toISOString(),
            kind: m.kind,
          }))

          const updatedStories = active.stories.map(s => s._id === res.story._id ? res.story : s)
          const updatePlot = (c: Chat): Chat => {
            if (c.id !== active.id || c.kind !== 'plot') return c
            return {
              ...c,
              stories: updatedStories,
              messages: [...c.messages, ...newStoryMessages]
            }
          }

          setChats(prev => prev.map(updatePlot))
          setActive(prev => prev ? updatePlot(prev) : prev)
        }
      } catch (e) {
        console.error('Error sending story message', e)
      } finally {
        setSending(false)
      }
    }
  }

  const handleCommand = async (command: string, param?: string) => {
    if (!active) return

    if (command === '/add-expertise' && isRealCharacter(active) && param) {
      const topic = learnedTopics.find(t => t.topic._id === param)
      if (!topic) return
      try {
        await addCharacterExpertise(active.id, param)
        const note: ChatMessage = {
          id: `sys-${Date.now()}`,
          chatId: active.id,
          senderId: activeActorId,
          text: `✦ ${active.kind === 'direct' ? active.actor.name : ''} is now well-versed in ${topic.topic.name}.`,
          timestamp: new Date().toISOString(),
          kind: 'system',
        }
        const appendNote = (c: Chat) => c.id === active.id ? { ...c, messages: [...c.messages, note] } : c
        setChats(prev => prev.map(appendNote))
        setActive(prev => prev ? appendNote(prev) : prev)
      } catch (e) {
        console.error(e)
      }
    } else if (command === '/start-story' && isTopicGroup(active)) {
      setSending(true)
      try {
        const newStory = await startStoryClient(active.topicId)
        if (newStory) {
          const msgs = await fetchStoryMessagesClient(newStory._id)
          const storyMsgs: ChatMessage[] = msgs.map(m => ({
            id: m._id,
            chatId: active.id,
            senderId: m.senderId,
            senderName: m.senderName,
            text: m.text,
            timestamp: m.createdAt ?? new Date().toISOString(),
            kind: m.kind,
          }))

          const updatedPlot: PlotChat = {
            ...active,
            stories: [newStory, ...(active.stories || []).filter(s => s._id !== newStory._id)],
            activeStoryId: newStory._id,
            messages: storyMsgs,
          }

          setChats(prev => prev.map(c => c.id === active.id ? updatedPlot : c))
          setActive(updatedPlot)
        }
      } catch (e) {
        console.error('Failed to start story', e)
      } finally {
        setSending(false)
      }
    }
  }

  const handleDelete = async () => {
    if (!active || !isRealCharacter(active)) return
    if (!window.confirm(`Delete ${active.actor.name}? This cannot be undone.`)) return
    try {
      await deleteCharacter(active.id)
      setChats(prev => prev.filter(c => c.id !== active.id))
      setActive(null)
      setShowInfo(false)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden border-t">
      <ChatListPane
        chats={chats}
        activeId={active?.id}
        onSelect={selectChat}
        onCharacterCreated={upsertCharacterChat}
      />
      {active ? (
        <>
          <ConversationPane
            chat={active}
            messages={active.messages}
            onSend={sendMessage}
            onToggleInfo={() => setShowInfo(s => !s)}
            sending={sending}
            learnedTopics={learnedTopics}
            isRealCharacter={isRealCharacter(active)}
            onCommand={handleCommand}
          />
          {showInfo && (
            <ChatInfoPanel
              chat={active}
              onClose={() => setShowInfo(false)}
              onDelete={isRealCharacter(active) ? handleDelete : undefined}
              onSelectStory={selectStoryInGroup}
            />
          )}
        </>
      ) : (
        <EmptyState />
      )}
    </div>
  )
}
