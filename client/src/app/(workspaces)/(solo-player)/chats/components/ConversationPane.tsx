'use client'
import { useEffect, useRef } from 'react'
import { Chat, ChatMessage } from '@/lib/chat-types'
import { ChatHeader } from './ChatHeader'
import { ChatInput } from './ChatInput'
import { MessageBubble } from './MessageBubble'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MyLearningTopic } from '@/lib/definitions'

const dayLabel = (iso: string) => {
  const date = new Date(iso)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
}

export const ConversationPane = ({
  chat,
  messages,
  onSend,
  onToggleInfo,
  sending,
  learnedTopics,
  isRealCharacter,
  onCommand
}: {
  chat: Chat
  messages: ChatMessage[]
  onSend: (text: string) => void
  onToggleInfo: () => void
  sending?: boolean
  learnedTopics?: MyLearningTopic[]
  isRealCharacter?: boolean
  onCommand?: (command: string, topicId: string) => void
}) => {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, chat.id])

  // group consecutive-day boundaries for WhatsApp-style date separators
  let lastDay = ''

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/30 via-background to-background">
      <div onClick={onToggleInfo} className="cursor-pointer">
        <ChatHeader chat={chat} />
      </div>
              <ScrollArea className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-3xl flex-col gap-2 px-4 py-4">
          {messages.map(m => {
            const day = new Date(m.timestamp).toDateString()
            const showDay = day !== lastDay
            lastDay = day
            return (
              <div key={m.id} className="flex flex-col gap-2">
                {showDay && (
                  <div className="my-2 flex justify-center">
                    <span className="rounded-md bg-card px-3 py-1 text-xs text-muted-foreground shadow-sm">
                      {dayLabel(m.timestamp)}
                    </span>
                  </div>
                )}
                <MessageBubble message={m} chat={chat} />
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
      <ChatInput
        onSend={onSend}
        onCommand={onCommand}
        sending={sending}
        learnedTopics={learnedTopics}
        showCommands={isRealCharacter}
      />
    </div>
  )
}
