'use client'
import { Chat } from '@/lib/chat-types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MoreVertical, Phone, Video, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

const initials = (name: string) =>
  name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()

export const ChatHeader = ({ chat }: { chat: Chat }) => {
  const isPlot = chat.kind === 'plot'
  const title = isPlot ? chat.title : chat.actor.name
  const avatar = isPlot ? chat.avatar : chat.actor.avatar
  const activeStory = isPlot ? chat.stories?.find(s => s._id === chat.activeStoryId) : null
  const sub = isPlot
    ? activeStory ? `Active story: ${activeStory.title}` : `${chat.stories?.length ?? 0} stories · Type /start-story`
    : chat.actor.online ? 'Online' : chat.actor.description

  return (
    <div className="flex items-center justify-between gap-3 border-b bg-card/60 px-4 py-2.5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative shrink-0">
          <Avatar className="size-10">
            <AvatarImage src={avatar} alt={title} />
            <AvatarFallback>{initials(title)}</AvatarFallback>
          </Avatar>
          {isPlot && (
            <span className="absolute -bottom-0.5 -right-0.5 grid place-items-center rounded-full bg-secondary p-0.5 ring-2 ring-background">
              <Users className="size-3 text-secondary-foreground" />
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold leading-tight">{title}</p>
          <p className="truncate text-xs text-muted-foreground leading-tight">{sub}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 text-muted-foreground">
        <Button variant="ghost" size="icon" title="Voice call (mock)"><Phone className="size-4" /></Button>
        <Button variant="ghost" size="icon" title="Video call (mock)"><Video className="size-4" /></Button>
        <Button variant="ghost" size="icon" title="More"><MoreVertical className="size-4" /></Button>
      </div>
    </div>
  )
}
