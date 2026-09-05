'use client'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, ChevronDown, ChevronUp, ClipboardCheck, Loader2, RotateCcw } from 'lucide-react'
import { LearningScoreResult, Topic, Word, WordAttemptRecord } from '@/lib/definitions'
import { scoreLearningAttempt } from '@/lib/actions'
import { SpeechTextarea } from '@/components/speech-textarea'

type Stage = 'test' | 'scoring' | 'result'

export default function TestClient({ topic, words }: { topic: Topic, words: Word[] }) {
  const [stage, setStage] = useState<Stage>('test')
  const [wordIndex, setWordIndex] = useState(0)
  const [phase, setPhase] = useState<'definition' | 'sentence'>('definition')
  const [input, setInput] = useState('')
  const [records, setRecords] = useState<WordAttemptRecord[]>([])
  const [scoreResult, setScoreResult] = useState<LearningScoreResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandedWords, setExpandedWords] = useState<Record<string, boolean>>({})

  const toggleWordExpanded = (w: string) => {
    setExpandedWords(prev => ({ ...prev, [w]: !prev[w] }))
  }

  const word = words[wordIndex]
  const canProceed = input.trim().length > 0

  const reset = () => {
    setStage('test')
    setWordIndex(0)
    setPhase('definition')
    setInput('')
    setRecords([])
    setScoreResult(null)
    setError(null)
  }

  const submit = async (finalRecords: WordAttemptRecord[]) => {
    setStage('scoring')
    try {
      // persistMastery=true: this is a topic-wide test, so the score becomes the user's topic mastery
      const result = await scoreLearningAttempt(topic._id, finalRecords, true)
      setScoreResult(result)
      setStage('result')
    } catch {
      setError('We could not score your answers. Please try again.')
      setStage('result')
    }
  }

  const proceed = useCallback(() => {
    if (!canProceed) return

    if (phase === 'definition') {
      setRecords(prev => [...prev, {
        word: word.word,
        meaning: word.meaning,
        userDefinition: input.trim(),
        example: word.example,
        userSentence: ''
      }])
      setInput('')
      setPhase('sentence')
      return
    }

    const finalRecords = records.map((r, i) => i === wordIndex ? { ...r, userSentence: input.trim() } : r)
    setRecords(finalRecords)
    setInput('')
    if (wordIndex + 1 < words.length) {
      setWordIndex(wordIndex + 1)
      setPhase('definition')
    } else {
      void submit(finalRecords)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canProceed, phase, input, word, wordIndex, words, records, topic._id])

  // Enter proceeds everywhere (Shift+Enter inserts a newline)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.shiftKey) return
      if (stage !== 'test') return
      e.preventDefault()
      proceed()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [stage, proceed])

  const progressPct = stage === 'result'
    ? 100
    : Math.round((wordIndex / words.length) * 100)

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-4 py-6">
      {/* Header / progress */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <ClipboardCheck /> Test: {topic.name}
          </h1>
          <span className="text-sm text-muted-foreground">
            {stage === 'test' ? `Word ${wordIndex + 1} of ${words.length}` : `${words.length} of ${words.length}`}
          </span>
        </div>
        <div className="h-2 w-full rounded bg-secondary overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* ---- Test round ---- */}
      {stage === 'test' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {phase === 'definition' ? (
                  <>Define <span className="text-primary">“{word.word}”</span></>
                ) : (
                  <>Use <span className="text-primary">“{word.word}”</span> in a sentence</>
                )}
              </span>
              <span className="flex gap-2">
                <Badge variant="secondary">{word.type}</Badge>
                <Badge variant="outline">{wordIndex + 1} / {words.length}</Badge>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SpeechTextarea
              autoFocus
              rows={4}
              placeholder={phase === 'definition' ? 'Its definition…' : 'Your sentence…'}
              value={input}
              onValueChange={setInput}
            />
          </CardContent>
          <CardFooter className="justify-between">
            <span className="text-xs text-muted-foreground">Enter to proceed · Shift+Enter for a new line</span>
            <Button onClick={proceed} disabled={!canProceed}>Proceed <ArrowRight /></Button>
          </CardFooter>
        </Card>
      )}

      {/* ---- Scoring ---- */}
      {stage === 'scoring' && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <Loader2 className="animate-spin" size={40} />
            <p className="text-lg">Scoring your test…</p>
          </CardContent>
        </Card>
      )}

      {/* ---- Result ---- */}
      {stage === 'result' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{error ? 'Something went wrong' : 'Test complete'}</span>
              {!error && scoreResult && (
                <span className="text-3xl font-bold">
                  <span className={scoreResult.overallScore === 100 ? 'text-green-500' : scoreResult.overallScore >= 70 ? 'text-amber-500' : 'text-destructive'}>
                    {scoreResult.overallScore}%
                  </span>
                  <span className="text-base font-normal text-muted-foreground"> mastery</span>
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {error && <p className="text-destructive">{error}</p>}
            {scoreResult?.overallPassed && (
              <p className="text-green-500 font-medium">Perfect score — full mastery of this topic! 🎉</p>
            )}
            {scoreResult?.feedback && <p>{scoreResult.feedback}</p>}
            {scoreResult?.results?.map(r => {
              const wordObj = words.find(w => w.word.toLowerCase() === r.word.toLowerCase())
              const isExpanded = Boolean(expandedWords[r.word])
              return (
                <div
                  key={r.word}
                  className="rounded-lg border bg-card/60 transition-colors overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleWordExpanded(r.word)}
                    className="w-full p-3 flex items-center justify-between text-left hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-foreground">{r.word}</span>
                      <span className="text-xs text-muted-foreground">
                        def {r.definitionScore}% · sentence {r.sentenceScore}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 text-muted-foreground">
                      <span className="text-xs">{isExpanded ? 'Hide' : 'Show details'}</span>
                      {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                    </div>
                  </button>

                  <div className="px-3 pb-3 flex flex-col gap-2">
                    {r.feedback && (
                      <p className={`text-sm rounded p-2 ${
                        r.definitionScore === 100 && r.sentenceScore === 100
                          ? 'bg-muted/40 text-muted-foreground'
                          : 'bg-destructive/10 text-destructive/90'
                      }`}>
                        {r.feedback}
                      </p>
                    )}

                    {isExpanded && wordObj && (
                      <div className="mt-1 pt-2 border-t flex flex-col gap-2 text-sm bg-muted/30 rounded p-2.5">
                        <div>
                          <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground block mb-0.5">
                            Expected Definition
                          </span>
                          <p className="text-foreground">{wordObj.meaning}</p>
                        </div>
                        {wordObj.example && (
                          <div>
                            <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground block mb-0.5">
                              Example Sentence
                            </span>
                            <p className="italic text-foreground/90">"{wordObj.example}"</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline" onClick={reset}><RotateCcw /> Retake test</Button>
            <Link href={`/topics/${topic._id}?tab=words`}>
              <Button>Back to topic</Button>
            </Link>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
