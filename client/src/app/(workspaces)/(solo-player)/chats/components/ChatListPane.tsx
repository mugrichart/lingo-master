'use client'
import { useState } from 'react'
import { Chat } from '@/lib/chat-types'
import { ChatListItem } from './ChatListItem'
import { CreateCharacterDialog } from './CreateCharacterDialog'
import { Character } from '@/lib/definitions'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { currentUserAvatar } from '@/lib/chat-data'
import { Search } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

export const ChatListPane = ({
  chats,
  activeId,
  onSelect,
  onCharacterCreated
}: {
  chats: Chat[]
  activeId?: string
  onSelect: (chat: Chat) => void
  onCharacterCreated: (c: Character) => void
}) => {
  const [query, setQuery] = useState('')

  const filtered = chats.filter(c => {
    const title = c.kind === 'direct' ? c.actor.name : c.title
    const sub = c.kind === 'direct' ? c.actor.description : c.topic
    const q = query.toLowerCase()
    return title.toLowerCase().includes(q) || sub.toLowerCase().includes(q)
  })

  const sorted = [...filtered].sort((a, b) => {
    const ta = a.messages[a.messages.length - 1]?.timestamp ?? ''
    const tb = b.messages[b.messages.length - 1]?.timestamp ?? ''
    return tb.localeCompare(ta)
  })

  return (
    <div className={cn('flex h-full w-full flex-col border-r bg-card/40 md:w-[380px] md:shrink-0', activeId && 'hidden md:flex')}>
      <div className="flex items-center justify-between border-b px-4 py-3">
        <Avatar className="size-10">
          <AvatarImage src={currentUserAvatar} alt="You" />
          <AvatarFallback>ME</AvatarFallback>
        </Avatar>
        <CreateCharacterDialog onCreated={onCharacterCreated} />
      </div>
      <div className="border-b px-3 py-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search or start a new chat"
            className="rounded-full bg-background/70 pl-9"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col">
          {sorted.map(chat => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              active={chat.id === activeId}
              onSelect={onSelect}
            />
          ))}
          {sorted.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">No chats match "{query}"</p>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
