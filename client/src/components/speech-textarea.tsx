'use client'
import { ChangeEvent, ComponentProps, useEffect, useRef, useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Mic, MicOff } from 'lucide-react'
import { useSpeechToText } from '@/hooks/use-speech-to-text'

type Props = Omit<ComponentProps<typeof Textarea>, 'value' | 'onChange'> & {
  value: string
  onValueChange: (value: string) => void
}

/**
 * Textarea with a speech-to-text mic button.
 * Partial (interim) transcription is rendered live inside the box while the
 * user speaks and is committed to `value` as soon as each phrase finalizes.
 */
export const SpeechTextarea = ({ value, onValueChange, ...props }: Props) => {
  const [interim, setInterim] = useState('')
  const valueRef = useRef(value)

  useEffect(() => {
    valueRef.current = value
  }, [value])

  const { supported, isListening, toggle } = useSpeechToText({
    onFinal: (text) => {
      const base = valueRef.current
      onValueChange(base ? `${base} ${text}` : text)
      setInterim('')
    },
    onInterim: setInterim
  })

  // show the not-yet-final transcription live in the box
  const interimSuffix = interim ? (value ? ` ${interim}` : interim) : ''
  const display = value + interimSuffix

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (!interimSuffix) {
      onValueChange(e.target.value)
      return
    }
    // while dictating, keep edits to the committed text; the live suffix is managed by the recognizer
    const baseLength = Math.max(e.target.value.length - interimSuffix.length, 0)
    onValueChange(e.target.value.slice(0, baseLength))
  }

  return (
    <div className="flex w-full gap-2 items-start">
      <Textarea value={display} onChange={handleChange} {...props} />
      {supported && (
        <Button
          type="button"
          variant={isListening ? 'destructive' : 'outline'}
          size="icon"
          onClick={toggle}
          aria-label={isListening ? 'Stop dictation' : 'Speak instead of typing'}
          title={isListening ? 'Stop dictation' : 'Speak instead of typing'}
        >
          {isListening ? <MicOff /> : <Mic />}
        </Button>
      )}
    </div>
  )
}
