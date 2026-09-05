'use client'
import { ChatMessage, Chat } from '@/lib/chat-types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Check, CheckCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const time = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

const initials = (name: string) =>
  name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()

const Status = ({ status }: { status?: ChatMessage['status'] }) => {
  if (status === 'read') return <CheckCheck className="size-4 text-sky-400" />
  if (status === 'delivered') return <CheckCheck className="size-4 text-muted-foreground" />
  return <Check className="size-4 text-muted-foreground" />
}

/** Per-sender accent colour for the avatar ring + name in group chats (WhatsApp-style). */
const ringColor = (seed: string) => {
  const palette = ['ring-emerald-500', 'ring-sky-500', 'ring-amber-500', 'ring-fuchsia-500', 'ring-rose-500', 'ring-indigo-500']
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
  return palette[Math.abs(h) % palette.length]
}
const nameColor = (seed: string) => {
  const palette = ['text-emerald-400', 'text-sky-400', 'text-amber-400', 'text-fuchsia-400', 'text-rose-400', 'text-indigo-400']
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
  return palette[Math.abs(h) % palette.length]
}

export const MessageBubble = ({ message, chat }: { message: ChatMessage, chat: Chat }) => {
  const own = message.senderId === 'me'
  const sender =
    chat.kind === 'plot'
      ? chat.members.find(m => m.id === message.senderId)
      : chat.kind === 'direct'
        ? chat.actor
        : undefined

  const showGroupSender = !own && chat.kind === 'plot' && sender

  return (
    <div className={cn('flex w-full items-end gap-2', own ? 'justify-end' : 'justify-start')}>
      {showGroupSender && (
        <Avatar className={cn('size-8 shrink-0 ring-2 ring-offset-2 ring-offset-background', ringColor(sender.id))}>
          <AvatarImage src={sender.avatar} alt={sender.name} />
          <AvatarFallback>{initials(sender.name)}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-[75%] rounded-lg px-3 py-2 shadow-sm',
          own
            ? 'rounded-br-none bg-emerald-700/90 text-emerald-50'
            : 'rounded-bl-none bg-card text-card-foreground'
        )}
      >
        {showGroupSender && (
          <p className={cn('mb-0.5 text-xs font-semibold', nameColor(sender.id))}>{sender.name}</p>
        )}
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.text}</p>
        <div className={cn('mt-1 flex items-center justify-end gap-1 text-[10px]', own ? 'text-emerald-100/70' : 'text-muted-foreground')}>
          <span>{time(message.timestamp)}</span>
          {own && <Status status={message.status} />}
        </div>
      </div>
    </div>
  )
}
