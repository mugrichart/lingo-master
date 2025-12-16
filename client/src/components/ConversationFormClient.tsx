'use client'
import React, { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Plus, Trash2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Word } from "@/lib/definitions"
import { Badge } from "./ui/badge"

import { handleBlanksGen } from "@/lib/utils"

/**
 Props:
  - initialTopicName: just used for display (optional)
 
 Form submission:
  - characters -> multiple inputs named "characters" (array)
  - line_text -> multiple inputs named "line_text" (array)
  - line_actor -> multiple hidden inputs named "line_actor" (array of actor indices)
  Server action should receive FormData and can reconstruct lines by order.
*/

export default function ConversationFormClient({ words }: { words: Word[] }) {
  const [characters, setCharacters] = useState<string[]>([""])
  const [usedWords, setUsedWords] = useState<string[]>([])
  const [lines, setLines] = useState<{ actor: number; text: string }[]>([
    { actor: 0, text: "" },
  ])

  useEffect(() => {
    const lastLine = lines[lines.length - 1]
    if (!lastLine) return;
    const { usedExpressions } = handleBlanksGen(lastLine.text, words.map(w => w.word))
    setUsedWords([...new Set([...usedWords, ...usedExpressions])])
  }, [lines])

  const addCharacter = () => setCharacters((s) => [...s, ""])
  const updateCharacter = (idx: number, val: string) =>
    setCharacters((s) => s.map((v, i) => (i === idx ? val : v)))

  const removeCharacter = (idx: number) => {
    setCharacters((s) => s.filter((_, i) => i !== idx))
    // adjust any line actor indices that pointed to removed char
    setLines((s) =>
      s.map((ln) => {
        if (ln.actor === idx) return { ...ln, actor: 0 }
        if (ln.actor > idx) return { ...ln, actor: ln.actor - 1 }
        return ln
      })
    )
  }

  const addLine = () => setLines((s) => [...s, { actor: 0, text: "" }])
  const updateLineText = (idx: number, val: string) =>
    setLines((s) => s.map((l, i) => (i === idx ? { ...l, text: val } : l)))
  const updateLineActor = (idx: number, actorIdx: number) =>
    setLines((s) => s.map((l, i) => (i === idx ? { ...l, actor: actorIdx } : l)))
  const removeLine = (idx: number) => setLines((s) => s.filter((_, i) => i !== idx))

  return (
    <>
      <Field>
        <label className="block text-sm font-medium text-muted-foreground">Title</label>
        <Input id="title" name="title" placeholder="Conversation title" required />
      </Field>

      <Field>
        <label className="block text-sm font-medium text-muted-foreground">Description</label>
        <Textarea id="description" name="description" placeholder="Describe the conversation" rows={3} required />
      </Field>

      <Field>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Characters</label>
          <Button size="sm" type="button" onClick={addCharacter}><Plus className="mr-2" />Add</Button>
        </div>

        <div className="space-y-2 mt-2">
          {characters.map((ch, idx) => (
            <div className="flex items-center gap-2" key={`char-${idx}`}>
              <Input
                name="characters"
                placeholder={`Character ${idx + 1} name`}
                value={ch}
                onChange={(e) => updateCharacter(idx, e.target.value)}
                required
              />
              <Button
                type="button"
                variant="destructive"
                onClick={() => removeCharacter(idx)}
                aria-label={`Remove character ${idx + 1}`}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
        </div>
      </Field>

      <Field>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Lines</label>
          <Button size="sm" type="button" onClick={addLine}><Plus className="mr-2" />Add Line</Button>
        </div>

        <div className="mt-2 space-y-2">
          {lines.map((line, idx) => (
            <div key={`line-${idx}`} className="flex flex-col gap-2">
              <div className="w-40">
                <Select
                  onValueChange={(val) => {
                    const actorIdx = Number(val || 0)
                    updateLineActor(idx, actorIdx)
                  }}
                  value={String(line.actor)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Actor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Actor</SelectLabel>
                      {characters.map((c, i) => (
                        <SelectItem key={i} value={String(i)}>
                          {c || `Character ${i + 1}`}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {/* hidden input so server receives actor index */}
                <input type="hidden" name="line_actor" value={String(line.actor)} />
              </div>

              <div className="flex-1">
                <Textarea
                  name="line_text"
                  placeholder="Dialogue text"
                  value={line.text}
                  onChange={(e) => updateLineText(idx, e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <div>
                <Button type="button" variant="destructive" onClick={() => removeLine(idx)}>
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div>
            <label className="text-sm font-medium">Key words:</label>
            <div className="flex gap-1 flex-wrap">
                {
                    words.map(word => <Badge variant={usedWords.includes(word.word) ? "default" : "outline"}>{word.word}</Badge>)
                }
            </div>
        </div>
      </Field>

      <div className="mt-4 flex justify-end">
        <Button type="submit">Create</Button>
      </div>
    </>
  )
}