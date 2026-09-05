'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Chat, ChatMessage, characterToDirectChat } from '@/lib/chat-types'
import { ChatListPane } from './components/ChatListPane'
import { ConversationPane } from './components/ConversationPane'
import { ChatInfoPanel } from './components/ChatInfoPanel'
import { MessageSquareText } from 'lucide-react'
import { Character, MyLearningTopic } from '@/lib/definitions'
import { fetchCharacterClient, fetchCharacterMessagesClient } from '@/lib/chat-client-data'
import { sendCharacterMessage, addCharacterExpertise, deleteCharacter } from '@/lib/actions'

const EmptyState = () => (
  <div className="hidden h-full flex-1 flex-col items-center justify-center gap-3 bg-background text-center md:flex">
    <div className="grid size-24 place-items-center rounded-full bg-accent">
      <MessageSquareText className="size-12 text-muted-foreground" />
    </div>
    <h2 className="text-xl font-semibold">Your conversations</h2>
    <p className="max-w-xs text-sm text-muted-foreground">
      Pick a chat to keep practising, or create a new contact to chat with an actor.
    </p>
  </div>
)

export default function ChatsClient({ initialChats, learnedTopics }: { initialChats: Chat[], learnedTopics: MyLearningTopic[] }) {
  const [chats, setChats] = useState<Chat[]>(initialChats)
  const [active, setActive] = useState<Chat | null>(null)
  const [showInfo, setShowInfo] = useState(false)
  const [sending, setSending] = useState(false)
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  // Ref to always have latest chats inside the polling interval
  const chatsRef = useRef<Chat[]>(chats)

  const isRealCharacter = (chat: Chat): chat is Extract<Chat, { kind: 'direct' }> =>
    chat.kind === 'direct' && !chat.actor.id.startsWith('dm-')

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
        status: 'read'
      }))
      setChats(prev => prev.map(c => c.id === chat.id ? { ...c, messages: mapped } : c))
      setActive(prev => prev && prev.id === chat.id ? { ...prev, messages: mapped } : prev)
    }
  }, [])

  const upsertCharacterChat = useCallback((character: Character) => {
    const chat = characterToDirectChat(character)
    setChats(prev => {
      const existing = prev.find(c => c.id === chat.id)
      if (existing) return prev.map(c => c.id === chat.id ? { ...chat, messages: c.messages } : c)
      return [chat, ...prev]
    })
    setActive(prev => (prev && prev.id === chat.id) ? { ...chat, messages: prev.messages } : prev)
  }, [])

  // poll pending characters until their avatar/fields are ready
  useEffect(() => {
    // keep ref up‑to‑date so interval callback sees latest chats
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
        // no more pending, stop polling
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
      text,
      timestamp: new Date().toISOString(),
      status: 'sent'
    }
    const appendUser = (c: Chat) => c.id === active.id ? { ...c, messages: [...c.messages, localMsg] } : c
    setChats(prev => prev.map(appendUser))
    setActive(prev => prev ? appendUser(prev) : prev)

    // mock plot/group chats have no backend round-trip
    if (!isRealCharacter(active)) return

    setSending(true)
    try {
      const { reply } = await sendCharacterMessage(active.id, text)
      const replyMsg: ChatMessage = {
        id: `reply-${Date.now()}`,
        chatId: active.id,
        senderId: activeActorId,
        text: reply,
        timestamp: new Date().toISOString()
      }
      const appendReply = (c: Chat) => c.id === active.id ? { ...c, messages: [...c.messages, replyMsg] } : c
      setChats(prev => prev.map(appendReply))
      setActive(prev => prev ? appendReply(prev) : prev)
    } catch (e) {
      console.error(e)
    } finally {
      setSending(false)
    }
  }

  const handleCommand = async (command: string, topicId: string) => {
    if (!active || !isRealCharacter(active)) return
    const topic = learnedTopics.find(t => t.topic._id === topicId)
    if (!topic) return

    if (command === '/add-expertise') {
      try {
        await addCharacterExpertise(active.id, topicId)
        const note: ChatMessage = {
          id: `sys-${Date.now()}`,
          chatId: active.id,
          senderId: activeActorId,
          text: `✦ ${active.kind === 'direct' ? active.actor.name : ''} is now well-versed in ${topic.topic.name}.`,
          timestamp: new Date().toISOString()
        }
        const appendNote = (c: Chat) => c.id === active.id ? { ...c, messages: [...c.messages, note] } : c
        setChats(prev => prev.map(appendNote))
        setActive(prev => prev ? appendNote(prev) : prev)
      } catch (e) {
        console.error(e)
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
          {showInfo && <ChatInfoPanel chat={active} onClose={() => setShowInfo(false)} onDelete={isRealCharacter(active) ? handleDelete : undefined} />}
        </>
      ) : (
        <EmptyState />
      )}
    </div>
  )
}
