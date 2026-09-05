'use client'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, ChevronDown, ChevronUp, Eye, EyeOff, GraduationCap, Loader2, PartyPopper, RotateCcw } from 'lucide-react'
import { LearningScoreResult, Topic, Word, WordAttemptRecord } from '@/lib/definitions'
import { scoreLearningAttempt, markTopicLearned } from '@/lib/actions'
import { SpeechTextarea } from '@/components/speech-textarea'

type TestSpec = {
  size: 5 | 10
  words: Word[]
  label: string
}

type Stage =
  | { kind: 'learn-definition' }
  | { kind: 'quiz-definition' }
  | { kind: 'learn-example' }
  | { kind: 'quiz-example' }
  | { kind: 'test' }
  | { kind: 'scoring' }
  | { kind: 'test-result' }
  | { kind: 'done' }

export default function LearnClient({ topic, words }: { topic: Topic, words: Word[] }) {
  const [wordIndex, setWordIndex] = useState(0)
  const [stage, setStage] = useState<Stage>({ kind: 'learn-definition' })
  const [input, setInput] = useState('')

  // test-round state
  const [pendingTests, setPendingTests] = useState<TestSpec[]>([])
  const [currentTest, setCurrentTest] = useState<TestSpec | null>(null)
  const [testIndex, setTestIndex] = useState(0)
  const [testPhase, setTestPhase] = useState<'definition' | 'sentence'>('definition')
  const [records, setRecords] = useState<WordAttemptRecord[]>([])
  const [scoreResult, setScoreResult] = useState<LearningScoreResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [expandedWords, setExpandedWords] = useState<Record<string, boolean>>({})

  const toggleWordExpanded = (w: string) => {
    setExpandedWords(prev => ({ ...prev, [w]: !prev[w] }))
  }

  const word = words[wordIndex]
  const needsInput = stage.kind === 'quiz-definition' || stage.kind === 'quiz-example' || stage.kind === 'test'
  const canProceed = !needsInput || input.trim().length > 0

  const resetTestState = () => {
    setRecords([])
    setTestIndex(0)
    setTestPhase('definition')
    setInput('')
    setScoreResult(null)
    setError(null)
  }

  /** After a word's learn loop completes, queue the 5-word / 10-word tests that trigger at this boundary. */
  const buildTestsForBoundary = (wordsLearned: number): TestSpec[] => {
    const total = words.length
    const tests: TestSpec[] = []

    const five = (wordsLearned % 5 === 0 || wordsLearned === total)
      ? words.slice(Math.max(0, wordsLearned - 5), wordsLearned)
      : null
    const ten = (wordsLearned % 10 === 0 || wordsLearned === total)
      ? words.slice(Math.max(0, wordsLearned - 10), wordsLearned)
      : null

    if (five) tests.push({ size: 5, words: five, label: `Checkpoint — last ${five.length} word${five.length > 1 ? 's' : ''}` })
    // skip the 10-word test if it is literally the same set as the 5-word test
    if (ten && !(five && ten.length === five.length && ten[0]._id === five[0]._id)) {
      tests.push({ size: 10, words: ten, label: wordsLearned === total ? `Final review — last ${ten.length} word${ten.length > 1 ? 's' : ''}` : `Review — last ${ten.length} words` })
    }
    return tests
  }

  // Mark the topic as learned once the user completes the whole loop.
  const markLearned = useCallback(() => { void markTopicLearned(topic._id) }, [topic._id])

  const advanceAfterPassedTest = () => {
    const remaining = pendingTests.slice(1)
    setPendingTests(remaining)
    resetTestState()
    if (remaining.length) {
      setCurrentTest(remaining[0])
      setStage({ kind: 'test' })
    } else {
      setCurrentTest(null)
      if (wordIndex + 1 < words.length) {
        setWordIndex(wordIndex + 1)
        setStage({ kind: 'learn-definition' })
      } else {
        markLearned()
        setStage({ kind: 'done' })
      }
    }
  }

  const submitTest = async (finalRecords: WordAttemptRecord[]) => {
    setStage({ kind: 'scoring' })
    try {
      const result = await scoreLearningAttempt(topic._id, finalRecords)
      setScoreResult(result)
      if (result.overallPassed) advanceAfterPassedTest()
      else setStage({ kind: 'test-result' })
    } catch {
      setError('We could not score your answers. Please try again.')
      setStage({ kind: 'test-result' })
    }
  }

  const handleTestProceed = () => {
    if (!currentTest) return
    const testedWord = currentTest.words[testIndex]

    if (testPhase === 'definition') {
      setRecords(prev => [...prev, {
        word: testedWord.word,
        meaning: testedWord.meaning,
        userDefinition: input.trim(),
        example: testedWord.example,
        userSentence: ''
      }])
      setInput('')
      setTestPhase('sentence')
      return
    }

    const finalRecords = records.map((r, i) => i === testIndex ? { ...r, userSentence: input.trim() } : r)
    setRecords(finalRecords)
    setInput('')
    if (testIndex + 1 < currentTest.words.length) {
      setTestIndex(testIndex + 1)
      setTestPhase('definition')
    } else {
      void submitTest(finalRecords)
    }
  }

  const proceed = useCallback(() => {
    if (!canProceed) return
    setRevealed(false)
    switch (stage.kind) {
      case 'learn-definition':
        setInput('')
        setStage({ kind: 'quiz-definition' })
        break
      case 'quiz-definition':
        setInput('')
        setStage({ kind: 'learn-example' })
        break
      case 'learn-example':
        setInput('')
        setStage({ kind: 'quiz-example' })
        break
      case 'quiz-example': {
        setInput('')
        const tests = buildTestsForBoundary(wordIndex + 1)
        if (tests.length) {
          resetTestState()
          setPendingTests(tests)
          setCurrentTest(tests[0])
          setStage({ kind: 'test' })
        } else if (wordIndex + 1 < words.length) {
          setWordIndex(wordIndex + 1)
          setStage({ kind: 'learn-definition' })
        } else {
          markLearned()
          setStage({ kind: 'done' })
        }
        break
      }
      case 'test':
        handleTestProceed()
        break
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, canProceed, input, wordIndex, words, currentTest, testIndex, testPhase, records, pendingTests, markLearned])

  // Enter proceeds everywhere (Shift+Enter inserts a newline in textareas)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.shiftKey) return
      if (['scoring', 'test-result', 'done'].includes(stage.kind)) return
      e.preventDefault()
      proceed()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [stage.kind, proceed])

  const retryTest = () => {
    resetTestState()
    setStage({ kind: 'test' })
  }

  const progressPct = Math.round(((wordIndex + (stage.kind === 'done' ? 1 : 0)) / words.length) * 100)

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-4 py-6">
      {/* Header / progress */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <GraduationCap /> Learning: {topic.name}
          </h1>
          <span className="text-sm text-muted-foreground">
            {stage.kind === 'done' ? 'Complete' : `Word ${Math.min(wordIndex + 1, words.length)} of ${words.length}`}
          </span>
        </div>
        <div className="h-2 w-full rounded bg-secondary overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* ---- Learn: show definition ---- */}
      {stage.kind === 'learn-definition' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-3xl">
              {word.word}
              <span className="flex gap-2">
                <Badge variant="secondary">{word.type}</Badge>
                <Badge variant="outline">{word['language style']}</Badge>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">{word.meaning}</p>
          </CardContent>
          <CardFooter className="justify-between">
            <span className="text-xs text-muted-foreground">Press Enter or click Proceed</span>
            <Button onClick={proceed}>Proceed <ArrowRight /></Button>
          </CardFooter>
        </Card>
      )}

      {/* ---- Quiz: recall the definition ---- */}
      {stage.kind === 'quiz-definition' && (
        <Card>
          <CardHeader>
            <CardTitle>What does <span className="text-primary">“{word.word}”</span> mean?</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {revealed && (
              <p className="rounded-md bg-muted p-3 text-muted-foreground">{word.meaning}</p>
            )}
            <SpeechTextarea
              autoFocus
              rows={4}
              placeholder="Type the definition in your own words…"
              value={input}
              onValueChange={setInput}
            />
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="ghost" size="sm" onClick={() => setRevealed(r => !r)}>
              {revealed ? <EyeOff /> : <Eye />} {revealed ? 'Hide definition' : 'Show definition'}
            </Button>
            <Button onClick={proceed} disabled={!canProceed}>Proceed <ArrowRight /></Button>
          </CardFooter>
        </Card>
      )}

      {/* ---- Learn: show example ---- */}
      {stage.kind === 'learn-example' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-muted-foreground">“{word.word}” used in a sentence</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg italic">{word.example}</p>
          </CardContent>
          <CardFooter className="justify-between">
            <span className="text-xs text-muted-foreground">Press Enter or click Proceed</span>
            <Button onClick={proceed}>Proceed <ArrowRight /></Button>
          </CardFooter>
        </Card>
      )}

      {/* ---- Quiz: use it in a sentence ---- */}
      {stage.kind === 'quiz-example' && (
        <Card>
          <CardHeader>
            <CardTitle>Use <span className="text-primary">“{word.word}”</span> in your own sentence</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {revealed && (
              <p className="rounded-md bg-muted p-3 italic text-muted-foreground">{word.example}</p>
            )}
            <SpeechTextarea
              autoFocus
              rows={4}
              placeholder={`Write a sentence using “${word.word}”…`}
              value={input}
              onValueChange={setInput}
            />
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="ghost" size="sm" onClick={() => setRevealed(r => !r)}>
              {revealed ? <EyeOff /> : <Eye />} {revealed ? 'Hide example' : 'Show example'}
            </Button>
            <Button onClick={proceed} disabled={!canProceed}>Proceed <ArrowRight /></Button>
          </CardFooter>
        </Card>
      )}

      {/* ---- Checkpoint / review test round ---- */}
      {stage.kind === 'test' && currentTest && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{currentTest.label}</span>
              <Badge variant="secondary">{testIndex + 1} / {currentTest.words.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {testPhase === 'definition' ? (
              <>
                <p className="text-lg">Define <span className="text-primary font-semibold">“{currentTest.words[testIndex].word}”</span></p>
                <SpeechTextarea
                  autoFocus
                  rows={4}
                  placeholder="Its definition…"
                  value={input}
                  onValueChange={setInput}
                />
              </>
            ) : (
              <>
                <p className="text-lg">Use <span className="text-primary font-semibold">“{currentTest.words[testIndex].word}”</span> in a sentence</p>
                <SpeechTextarea
                  autoFocus
                  rows={4}
                  placeholder="Your sentence…"
                  value={input}
                  onValueChange={setInput}
                />
              </>
            )}
          </CardContent>
          <CardFooter className="justify-between">
            <span className="text-xs text-muted-foreground">You must score 100% to continue</span>
            <Button onClick={proceed} disabled={!canProceed}>Proceed <ArrowRight /></Button>
          </CardFooter>
        </Card>
      )}

      {/* ---- Scoring ---- */}
      {stage.kind === 'scoring' && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <Loader2 className="animate-spin" size={40} />
            <p className="text-lg">Scoring your answers…</p>
          </CardContent>
        </Card>
      )}

      {/* ---- Test failed ---- */}
      {stage.kind === 'test-result' && (
        <Card>
          <CardHeader>
            <CardTitle>
              {error ? 'Something went wrong' : `Not quite there — ${scoreResult?.overallScore ?? 0}% (100% required)`}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {error && <p className="text-destructive">{error}</p>}
            {scoreResult?.feedback && <p>{scoreResult.feedback}</p>}
            {scoreResult?.results?.filter(r => r.feedback || r.definitionScore < 100 || r.sentenceScore < 100).map(r => {
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
                      <p className="text-sm text-destructive/90 bg-destructive/10 rounded p-2">
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
          <CardFooter className="justify-end">
            <Button onClick={retryTest}><RotateCcw /> Retry this test</Button>
          </CardFooter>
        </Card>
      )}

      {/* ---- Congratulations ---- */}
      {stage.kind === 'done' && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <PartyPopper size={56} className="text-primary" />
            <h2 className="text-3xl font-bold">Congratulations! 🎉</h2>
            <p className="text-lg text-muted-foreground max-w-md">
              You mastered all {words.length} word{words.length > 1 ? 's' : ''} in
              <span className="font-semibold text-foreground"> {topic.name}</span> — every definition and every sentence scored 100%.
            </p>
            <div className="flex gap-3 mt-2">
              <Link href={`/topics/${topic._id}?tab=words`}>
                <Button variant="outline">Back to topic</Button>
              </Link>
              <Link href="/topics">
                <Button>Explore more topics</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
