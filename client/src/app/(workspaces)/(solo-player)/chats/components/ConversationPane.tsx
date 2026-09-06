'use client'
import { useEffect, useRef, useState } from 'react'
import { Lightbulb, Loader2, Users } from 'lucide-react'
import { Chat, ChatMessage } from '@/lib/chat-types'
import { ChatHeader } from './ChatHeader'
import { ChatInput } from './ChatInput'
import { MessageBubble } from './MessageBubble'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MyLearningTopic } from '@/lib/definitions'
import { Button } from '@/components/ui/button'

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
  storyStarting,
  targetReward,
  latestHint,
  learnedTopics,
  isRealCharacter,
  onCommand
}: {
  chat: Chat
  messages: ChatMessage[]
  onSend: (text: string) => void
  onToggleInfo: () => void
  sending?: boolean
  storyStarting?: boolean
  targetReward?: { storyId: string, word: string } | null
  latestHint?: { storyId: string, word: string } | null
  learnedTopics?: MyLearningTopic[]
  isRealCharacter?: boolean
  onCommand?: (command: string, param?: string) => void
}) => {
  const bottomRef = useRef<HTMLDivElement>(null)
  const [hintVisible, setHintVisible] = useState(false)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    setHintVisible(false)
  }, [messages.length, chat.id])

  // group consecutive-day boundaries for WhatsApp-style date separators
  let lastDay = ''

  const isPlot = chat.kind === 'plot'
  const activeStory = isPlot ? chat.stories?.find(s => s._id === chat.activeStoryId) : null
  const hintWord = activeStory && latestHint?.storyId === activeStory._id ? latestHint.word : null

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/30 via-background to-background">
      <div onClick={onToggleInfo} className="cursor-pointer">
        <ChatHeader chat={chat} />
      </div>

      {isPlot && activeStory && (
        <div className="flex items-center justify-between border-b bg-card/40 px-4 py-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-emerald-500">📖 {activeStory.title}</span>
            <span className="text-muted-foreground hidden sm:inline">·</span>
            <span className="text-muted-foreground hidden sm:inline">{activeStory.setting}</span>
          </div>
          <div className="flex items-center gap-2">
            {targetReward?.storyId === activeStory._id ? (
              <div className="flex animate-pulse items-center gap-1.5 font-medium">
                <span className="text-emerald-500">Target word used:</span>
                <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 font-mono text-emerald-500">
                  {targetReward.word}
                </span>
              </div>
            ) : activeStory.status === 'completed' ? (
              <span className="font-semibold text-emerald-500">🎉 Story Completed!</span>
            ) : null}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
              disabled={!hintWord}
              onClick={() => setHintVisible(value => !value)}
              title={hintWord ? 'Reveal the semantic hint used by the companion' : 'No semantic hint was used'}
            >
              <Lightbulb className="size-3.5" /> Hint
            </Button>
            {hintVisible && hintWord && (
              <span className="rounded bg-amber-500/10 px-2 py-1 text-amber-500">
                Try something related to “{hintWord}”
              </span>
            )}
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-3xl flex-col gap-2 px-4 py-4">
          {isPlot && storyStarting && (
            <div className="my-12 flex flex-col items-center justify-center gap-3 text-center">
              <Loader2 className="size-8 animate-spin text-emerald-500" />
              <h3 className="text-lg font-semibold">Writing your story starter…</h3>
              <p className="max-w-md text-sm text-muted-foreground">
                The narrator is setting the scene, preparing your companions, and weaving in your target vocabulary.
              </p>
            </div>
          )}
          {isPlot && !storyStarting && (!activeStory || messages.length === 0) && (
            <div className="my-12 flex flex-col items-center justify-center gap-3 text-center px-4">
              <div className="grid size-16 place-items-center rounded-full bg-emerald-500/10 text-2xl text-emerald-500">
                ✨
              </div>
              <h3 className="text-lg font-semibold">{chat.title} Stories</h3>
              <p className="max-w-md text-sm text-muted-foreground">
                No active story currently selected. Type <code className="font-mono font-bold text-foreground">/start-story</code> below to scaffold an interactive roleplay scenario with AI companions, a Dungeon Master, and vocabulary targets.
              </p>
            </div>
          )}
          {isPlot && activeStory && (
            <div className="rounded-lg border bg-card/40 px-4 py-3">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Users className="size-3.5" /> Cast
              </div>
              <div className="flex flex-wrap gap-2">
                {activeStory.cast.map(actor => (
                  <div key={actor.id} className="rounded-md bg-muted/60 px-2.5 py-1.5 text-sm">
                    <span className="font-semibold">{actor.isUser ? `You: ${actor.name}` : actor.name}</span>
                    <span className="ml-1.5 text-xs text-muted-foreground">{actor.role}</span>
                  </div>
                ))}
              </div>
              {activeStory.cast.find(actor => actor.isUser) && (
                <p className="mt-2 text-xs text-muted-foreground">
                  You play as <span className="font-semibold text-foreground">{activeStory.cast.find(actor => actor.isUser)?.name}</span>.
                </p>
              )}
            </div>
          )}
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
        showCommands={true}
        isGroupChat={isPlot}
      />
    </div>
  )
}
