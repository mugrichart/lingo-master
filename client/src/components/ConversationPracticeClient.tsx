"use client"
import React, { useEffect, useRef, useState } from "react"
import { Convo, Word } from "@/lib/definitions"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"
import { useRouter } from 'next/navigation'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
} from "@/components/ui/select"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { handleBlanksGen } from "@/lib/utils"
import { range, shuffleArray } from "@/lib/utils/shuffle"

type Props = {
  convo: Convo,
  words: Word[]
}

export default function ConversationPracticeClient({ convo, words }: Props) {
  const [step, setStep] = useState<'choose'|'practice'>('choose')
  const [playerIndex, setPlayerIndex] = useState<number | null>(null)
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null)
  const [selectedCharacterIndex, setSelectedCharacterIndex] = useState<number | null>(null)
  const [currentLine, setCurrentLine] = useState<number>(0)
  const [messages, setMessages] = useState<any[]>([])
  const [inputValue, setInputValue] = useState('')
  const [showBlankChoicesForLine, setShowBlankChoicesForLine] = useState<number | null>(null)
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([])
  const viewportRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    setMessages([])
    setCurrentLine(0)
    setInputValue('')
    setShowBlankChoicesForLine(null)
    setSelectedAnswers([])
  }, [convo._id])

  useEffect(() => {
    // auto-play non-player lines until it's the player's turn or convo ends
    if (step !== 'practice' || playerIndex === null) return

    const next = convo.lines[currentLine]
    if (!next) return

    if (next.actor !== playerIndex) {
      // display other actor line
      setMessages((m) => [...m, { actor: next.actor, text: next.text, blanked: false }])
      // advance after short delay
      const t = setTimeout(() => setCurrentLine((i) => i + 1), 700)
      return () => clearTimeout(t)
    }
    // if it's player's turn, wait for input
  }, [currentLine, step, playerIndex, convo.lines])

  useEffect(() => {
    if (!viewportRef.current) return

    const viewport = viewportRef.current.querySelector(
      '[data-slot="scroll-area-viewport"]'
    ) as HTMLDivElement | null

    if (!viewport) return

    viewport.scrollTop = viewport.scrollHeight
  }, [messages])

  function chooseCharacter(idx: number) {
    setPlayerIndex(idx)
    setStep('practice')
  }

  function handleSend() {
    if (playerIndex === null) return
    // add player's submitted line as temporary
    const tempMsg = { actor: playerIndex, text: inputValue, blanked: false, temp: true }
    setMessages((m) => [...m, tempMsg])
    setInputValue('')

    const line = convo.lines[currentLine]
    const match = handleBlanksGen(inputValue, line.text.split(" ")).usedExpressions.length / line.text.split(" ").length
    if (match > .69) {
        setMessages((m) => [...m.slice(0, -1), { actor: line.actor, text: line.text }])
        setCurrentLine(i => i + 1);
        return;
    }
    // after 2s replace the temp message with the blanked one and show choices
    setTimeout(() => {
      setMessages((m) => m.filter((mm) => mm !== tempMsg))
      if (line) {
        setMessages((m) => [...m, { actor: line.actor, text: line.blankedText, blanked: true }])
        if (line.text !== line.blankedText) setShowBlankChoicesForLine(currentLine)
        else setCurrentLine(i => i + 1)
      }
    }, 2000)
  }

  function handleChooseBlankWord(word: string) {
    setSelectedAnswers((s) => [...s, word])
    const line = convo.lines[currentLine]
    // replace the last blanked message with the correct full sentence and mark as correct
    setMessages((m) => {
      let idx = -1
      for (let i = m.length - 1; i >= 0; i--) {
        if (m[i].blanked) { idx = i; break }
      }
      if (idx === -1) return [...m, { actor: line.actor, text: line.text, blanked: false, correct: true }]
      const copy = [...m]
      copy[idx] = { actor: line.actor, text: line.text, blanked: false, correct: true }
      return copy
    })
    setShowBlankChoicesForLine(null)
    // small delay so user sees the correct sentence in green, then advance
    setTimeout(() => setCurrentLine((i) => i + 1), 800)
  }

  return (
    <Card className="p-4">
        <Accordion type="single" collapsible defaultValue="">
          <AccordionItem value="item-1" className="w-fit">
            <AccordionTrigger className="text-2xl">{convo.title}</AccordionTrigger>
            <AccordionContent>
              <div className="text-sm text-muted-foreground">{convo.description}</div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      {step === 'choose' && (
        <div className="space-y-4">
          <h2 className="">Practice Conversation</h2>

          <div className="flex items-center gap-3">
            <div className="w-72">
              <Select onValueChange={(v) => setSelectedCharacterIndex(v ? Number(v) : null)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select character" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Characters</SelectLabel>
                    {convo.characters.map((c, i) => (
                      <SelectItem key={i} value={String(i)}>
                        <div className="flex items-center gap-2">
                          <Avatar>
                            <AvatarFallback>{c?.[0] ?? '?'}</AvatarFallback>
                          </Avatar>
                          <span>{c}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={() => { if (selectedCharacterIndex !== null) chooseCharacter(selectedCharacterIndex) }} disabled={selectedCharacterIndex === null}>
              Start Practice
            </Button>
          </div>
        </div>
      )}

      {step === 'practice' && (
        <div className="flex flex-col h-[60vh] w-150">
          <div className="flex-1 border rounded-md overflow-hidden">
            <ScrollArea ref={viewportRef} className="h-full">
              <div className="p-4 space-y-3">
                {messages.map((m, idx) => {
                  const isPlayer = m.actor === playerIndex
                  const actorName = convo.characters[m.actor] ?? 'Unknown'

                  let bubbleClass = 'rounded-md px-3 py-2 max-w-[70%]'
                  if (m.correct) bubbleClass = 'bg-emerald-600 text-white rounded-md px-3 py-2 max-w-[70%]'
                  else if (m.blanked) bubbleClass = 'bg-emerald-100 text-emerald-800 rounded-md px-3 py-2 max-w-[70%]'
                  else if (isPlayer) bubbleClass = 'bg-primary text-primary-foreground ml-auto rounded-md px-3 py-2 max-w-[70%]'
                  else bubbleClass = 'bg-muted rounded-md px-3 py-2 max-w-[70%]'

                  return (
                    <div key={idx} className={`flex gap-3 ${isPlayer ? 'justify-end' : 'justify-start'}`}>
                      {!isPlayer && (
                        <div className="flex items-start gap-2">
                          <Avatar>
                            <AvatarFallback>{actorName?.[0] ?? '?'}</AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                      <div className={bubbleClass}>
                        <div className="text-sm">{m.text}</div>
                      </div>
                      {isPlayer && (
                        <div className="flex items-start gap-2">
                          <Avatar>
                            <AvatarFallback>{actorName?.[0] ?? '?'}</AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </div>

          <div className="mt-3">
            <div className="mb-2">
              {(() => {
                const line = convo.lines[currentLine]
                if (!line) return null
                if (playerIndex !== null && line.actor === playerIndex) {
                  return <div className="inline-block bg-green-100 text-green-800 text-sm px-2 py-1 rounded">Your turn</div>
                }
                const actorName = convo.characters[line.actor] ?? 'Other'
                return <div className="inline-block bg-muted px-2 py-1 text-sm rounded">{actorName}'s turn</div>
              })()}
            </div>
            {showBlankChoicesForLine !== null ? (
              <div className="space-y-2">
                <div className="text-sm">Choose the missing word</div>
                <div className="flex gap-2 flex-wrap">
                  {shuffleArray([
                    ...shuffleArray(range(words.length)).slice(0, 3).map(idx => words[idx].word), 
                    ...convo.lines[currentLine].usedWords
                  ]).map((w, i) => (
                    <Button key={i} onClick={() => handleChooseBlankWord(w)}>{w}</Button>
                  ))}
                </div>
              </div>
            ) : (
              // if it's player's turn for current line, show input. Otherwise show disabled input
              (() => {
                const line = convo.lines[currentLine]
                if (!line) return (
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground">Conversation finished</div>
                    <div className="ml-4">
                      <Button onClick={() => {
                        // reset to choose and clear state
                        setStep('choose')
                        setPlayerIndex(null)
                        setSelectedCharacterIndex(null)
                        setMessages([])
                        setCurrentLine(0)
                        setInputValue('')
                        setShowBlankChoicesForLine(null)
                        setSelectedAnswers([])
                      }}>Practice again</Button>
                    </div>
                    <div>
                      <Button variant="ghost" onClick={() => router.back()}>Back</Button>
                    </div>
                  </div>
                )
                if (line.actor === playerIndex) {
                  return (
                    <div className="flex gap-2">
                      <Textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} rows={2} className="flex-1" />
                      <Button onClick={handleSend}>
                        <Send />
                      </Button>
                    </div>
                  )
                }
                return <div className="text-sm text-muted-foreground">Waiting for other characters...</div>
              })()
            )}
          </div>
        </div>
      )}
    </Card>
  )
}
