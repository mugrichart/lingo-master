'use client'
import { useState } from 'react'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MessageSquarePlus, Loader2 } from 'lucide-react'
import { createCharacter } from '@/lib/actions'
import { Character } from '@/lib/definitions'

export const CreateCharacterDialog = ({ onCreated }: { onCreated: (c: Character) => void }) => {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [appearance, setAppearance] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const reset = () => { setName(''); setAppearance(''); setDescription('') }

  const submit = async () => {
    setSubmitting(true)
    try {
      const character = await createCharacter({
        name: name.trim() || undefined,
        appearance: appearance.trim() || undefined,
        description: description.trim() || undefined
      })
      onCreated(character)
      setOpen(false)
      reset()
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="New contact">
          <MessageSquarePlus className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New contact</DialogTitle>
          <DialogDescription>
            Describe the person you'd like to chat with. Anything you leave blank will be invented for you, and a portrait will be generated in the background.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="cc-name">Full name <span className="text-muted-foreground">(optional)</span></Label>
            <Input id="cc-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ada Lovelace" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="cc-appearance">Appearance <span className="text-muted-foreground">(optional)</span></Label>
            <Textarea id="cc-appearance" rows={2} value={appearance} onChange={e => setAppearance(e.target.value)} placeholder="How should they look? (age, style, vibe…)" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="cc-desc">Extra description <span className="text-muted-foreground">(optional)</span></Label>
            <Textarea id="cc-desc" rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Hobbies, humour, how they talk, what they care about…" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={submitting}>
            {submitting && <Loader2 className="animate-spin" />}
            Create contact
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
