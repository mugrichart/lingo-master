'use client'
import { useEffect, useRef, useState } from 'react'

type SpeechToTextOptions = {
  /** Called with every finalized transcript chunk. */
  onFinal?: (transcript: string) => void
  /** Called with the live, not-yet-final transcript as the user speaks ('' when nothing is pending). */
  onInterim?: (transcript: string) => void
}

/**
 * Speech-to-text hook built on the Web Speech API.
 * interimResults is enabled so callers receive real-time partial transcripts
 * (onInterim) instead of waiting for a full pause to get final chunks (onFinal).
 */
export function useSpeechToText({ onFinal, onInterim }: SpeechToTextOptions = {}) {
  const [isListening, setIsListening] = useState(false)
  const [supported, setSupported] = useState(false)
  const recognitionRef = useRef<any>(null)
  const callbacksRef = useRef<SpeechToTextOptions>({ onFinal, onInterim })

  useEffect(() => {
    callbacksRef.current = { onFinal, onInterim }
  }, [onFinal, onInterim])

  useEffect(() => {
    const w = window as any
    setSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition))
    return () => {
      recognitionRef.current?.stop()
      recognitionRef.current = null
    }
  }, [])

  const toggle = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      return
    }

    const w = window as any
    const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    // stream partial hypotheses so the UI can show words as they are spoken
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: any) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          const text = result[0].transcript.trim()
          if (text) callbacksRef.current.onFinal?.(text)
        } else {
          interim += result[0].transcript
        }
      }
      callbacksRef.current.onInterim?.(interim.trim())
    }
    recognition.onend = () => {
      setIsListening(false)
      callbacksRef.current.onInterim?.('')
    }
    recognition.onerror = () => setIsListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }

  return { supported, isListening, toggle }
}
