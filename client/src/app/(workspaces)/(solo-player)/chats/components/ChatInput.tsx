'use client'
import { useMemo, useState, KeyboardEvent, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mic, Paperclip, Send, Smile, BookPlus, Sparkles, Loader2 } from 'lucide-react'
import { MyLearningTopic } from '@/lib/definitions';
import { useClickOutside } from '@/hooks/useClickOutside';

export const ChatInput = ({
  onSend,
  onCommand,
  sending,
  learnedTopics,
  showCommands,
  isGroupChat,
}: {
  onSend: (text: string) => void,
  onCommand?: (command: string, param?: string) => void,
  sending?: boolean,
  learnedTopics?: MyLearningTopic[],
  showCommands?: boolean,
  isGroupChat?: boolean,
}) => {
  const pickerRef = useRef<HTMLDivElement>(null);
  useClickOutside(pickerRef, () => setTopicPickerFor(null));
  const [value, setValue] = useState('')
  const [topicPickerFor, setTopicPickerFor] = useState<string | null>(null)

  const availableCommands = useMemo(() => {
    const list = []
    if (isGroupChat) {
      list.push({ name: '/start-story', description: 'Scaffold a new interactive story scenario in this topic', icon: Sparkles })
    } else {
      list.push({ name: '/add-expertise', description: 'Teach this contact one of your learned topics', icon: BookPlus })
    }
    return list
  }, [isGroupChat])

  const isCommand = value.startsWith('/')
  const matched = useMemo(
    () => availableCommands.filter(c => c.name.startsWith(value.split(' ')[0])),
    [value, availableCommands]
  )
  const showCommandList = Boolean(isCommand && matched.length && !topicPickerFor)

  const send = () => {
    const text = value.trim()
    if (!text) return
    if (text === '/start-story' && isGroupChat) {
      onCommand?.('/start-story')
      setValue('')
      return
    }
    if (text.startsWith('/')) return
    onSend(text)
    setValue('')
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); send() }
    if (e.key === 'Escape') { setTopicPickerFor(null); setValue('') }
  }

  const pickCommand = (cmd: string) => {
    if (cmd === '/add-expertise') {
      setTopicPickerFor(cmd)
      setValue('')
    } else if (cmd === '/start-story') {
      onCommand?.('/start-story')
      setValue('')
    }
  }

  const pickTopic = (topicId: string) => {
    onCommand?.('/add-expertise', topicId)
    setTopicPickerFor(null)
  }

  return (
    <div className="relative border-t bg-card/60">
      {showCommandList && (
        <div className="absolute bottom-full left-0 mb-1 w-full max-w-md rounded-lg border bg-popover p-1 shadow-lg">
          {matched.map(c => {
            const Icon = c.icon
            return (
              <button key={c.name} onClick={() => pickCommand(c.name)}
                className="flex w-full items-start gap-2 rounded-md px-3 py-2 text-left hover:bg-accent">
                <Icon className="mt-0.5 size-4 text-emerald-500" />
                <span>
                  <span className="block font-mono text-sm font-medium">{c.name}</span>
                  <span className="block text-xs text-muted-foreground">{c.description}</span>
                </span>
              </button>
            )
          })}
        </div>
      )}

      {topicPickerFor === '/add-expertise' && (
        <div className="relative" ref={pickerRef}>
          <div className="absolute bottom-full left-0 mb-1 w-full max-w-md rounded-lg border bg-popover p-2 shadow-lg">
            <button className="absolute top-2 right-2 text-muted-foreground hover:text-foreground" onClick={() => setTopicPickerFor(null)}>×</button>
            <p className="mb-2 px-1 text-xs font-semibold text-muted-foreground">Pick a learned topic to add as expertise</p>
            <div className="flex max-h-56 flex-col gap-1 overflow-y-auto">
              {(learnedTopics ?? []).length === 0 && (
                <p className="px-1 py-2 text-sm text-muted-foreground">No learned topics yet — finish a learn loop first.</p>
              )}
              {(learnedTopics ?? []).map(t => (
                <button key={t.topic._id} onClick={() => pickTopic(t.topic._id)}
                  className="flex items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-accent">
                  <span>{t.topic.name}</span>
                  <span className="text-xs text-muted-foreground">{t.topicLevel}%</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 px-3 py-2.5">
        <Button variant="ghost" size="icon" className="text-muted-foreground" title="Emoji (mock)">
          <Smile className="size-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground" title="Attach (mock)">
          <Paperclip className="size-5" />
        </Button>
        <Input
          value={value}
          onChange={e => { setValue(e.target.value); setTopicPickerFor(null) }}
          onKeyDown={onKeyDown}
          placeholder={showCommands ? 'Type a message, or / for commands' : 'Type a message'}
          className="flex-1 rounded-full bg-background/70"
        />
        {value.trim() && !value.startsWith('/') ? (
          <Button size="icon" className="rounded-full bg-emerald-600 hover:bg-emerald-700" onClick={send} disabled={sending} title="Send">
            {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </Button>
        ) : (
          <Button size="icon" className="rounded-full" variant="secondary" title="Voice message (mock)">
            <Mic className="size-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
