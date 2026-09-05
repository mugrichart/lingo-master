'use client'
import { Chat } from '@/lib/chat-types'
import { formatChatTime } from '@/lib/chat-data'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const initials = (name: string) =>
  name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()

const display = (chat: Chat) =>
  chat.kind === 'direct'
    ? { title: chat.actor.name, subtitle: chat.actor.description, avatar: chat.actor.avatar }
    : { title: chat.title, subtitle: `${chat.topic} · ${chat.members.length} members`, avatar: chat.avatar }

const lastMessage = (chat: Chat) => chat.messages[chat.messages.length - 1]

export const ChatListItem = ({ chat, active, onSelect }: { chat: Chat, active: boolean, onSelect: (chat: Chat) => void }) => {
  const d = display(chat)
  const last = lastMessage(chat)

  return (
    <button
      onClick={() => onSelect(chat)}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-accent/60',
        active && 'bg-accent'
      )}
    >
      <div className="relative shrink-0">
        <Avatar className="size-12">
          <AvatarImage src={d.avatar} alt={d.title} />
          <AvatarFallback>{initials(d.title)}</AvatarFallback>
        </Avatar>
        {chat.kind === 'plot' && (
          <span className="absolute -bottom-0.5 -right-0.5 grid place-items-center rounded-full bg-secondary p-0.5 ring-2 ring-background">
            <Users className="size-3 text-secondary-foreground" />
          </span>
        )}
        {chat.kind === 'direct' && chat.actor.online && (
          <span className="absolute bottom-0 right-0 size-3 rounded-full bg-emerald-500 ring-2 ring-background" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate font-medium">{d.title}</span>
          {last && (
            <span className={cn('shrink-0 text-xs', chat.unreadCount > 0 ? 'text-emerald-500 font-semibold' : 'text-muted-foreground')}>
              {formatChatTime(last.timestamp)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm text-muted-foreground">
            {last ? `${last.senderId === 'me' ? 'You: ' : ''}${last.text}` : d.subtitle}
          </span>
          {chat.unreadCount > 0 && (
            <Badge className="h-5 min-w-5 shrink-0 rounded-full bg-emerald-500 px-1.5 text-[11px] text-white">
              {chat.unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </button>
  )
}
