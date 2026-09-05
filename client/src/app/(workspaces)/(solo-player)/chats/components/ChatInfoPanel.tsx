'use client'
import { Chat } from '@/lib/chat-types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { X, Users, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

const initials = (name: string) =>
  name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()

export const ChatInfoPanel = ({ chat, onClose, onDelete }: { chat: Chat, onClose: () => void, onDelete?: () => void }) => {
  const isPlot = chat.kind === 'plot'
  const title = isPlot ? chat.title : chat.actor.name
  const avatar = isPlot ? chat.avatar : chat.actor.avatar

  return (
    <div className="flex h-full w-80 flex-col border-l bg-card/40">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <span className="text-sm font-semibold">{isPlot ? 'Plot info' : 'Contact info'}</span>
        <Button variant="ghost" size="icon" onClick={onClose} title="Close">
          <X className="size-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
          <Avatar className="size-32">
            <AvatarImage src={avatar} alt={title} />
            <AvatarFallback className="text-3xl">{initials(title)}</AvatarFallback>
          </Avatar>
          <p className="mt-2 text-lg font-semibold">{title}</p>
          {isPlot
            ? <Badge variant="secondary"><Users className="mr-1 size-3" />{chat.topic}</Badge>
            : <p className="text-sm text-muted-foreground">{chat.actor.description}</p>
          }
        </div>
        <Separator />
        <div className="px-4 py-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {isPlot ? 'About this group' : 'About'}
          </p>
          <p className="text-sm leading-relaxed">
            {isPlot ? chat.description : chat.actor.bio}
          </p>
        </div>
        {isPlot && (
          <>
            <Separator />
            <div className="px-4 py-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Stories in this group
              </p>
              <div className="flex flex-col gap-2">
                {chat.plots.map(plot => (
                  <div key={plot} className="flex items-center gap-2 text-sm">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    {plot}
                  </div>
                ))}
              </div>
            </div>
            <Separator />
            <div className="px-4 py-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {chat.members.length} members
              </p>
              <div className="flex flex-col gap-3">
                {chat.members.map(m => (
                  <div key={m.id} className="flex items-center gap-3">
                    <Avatar className="size-10">
                      <AvatarImage src={m.avatar} alt={m.name} />
                      <AvatarFallback>{initials(m.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{m.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{m.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </ScrollArea>
      {!isPlot && onDelete && (
        <div className="border-t px-4 py-4">
          <Button
            variant="destructive"
            className="w-full gap-2"
            onClick={onDelete}
          >
            <Trash2 className="size-4" />
            Delete Contact
          </Button>
        </div>
      )}
    </div>
  )
}
