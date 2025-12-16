import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// class to handle checking the matching between a sentence and one or multiple expressions
export class SentenceExpressionMatchProcessor {
    THRESHOLD = 70/100
    PERFECT_SCORE = 90/100
    DASH_COUNT = 5

    constructor(sentence, expressions) {
      this.sentence = sentence
      this.expressions = expressions
      this.usedExpressions = []
    }

    removePunctuation (str) {
      return str.replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, "")
    }

    handleProcess() {
      for (const expression of this.expressions) {
          const cleanExpr = this.removePunctuation(expression).toLowerCase()
          const matchedSlice = this.handleExpressionMatch(cleanExpr, this.sentence)
          if (matchedSlice) {
            this.sentence = this.sentence.replace(matchedSlice, '-'.repeat(this.DASH_COUNT))
            this.usedExpressions.push(expression)
          }
      }
    }


    handleExpressionMatch (expression, sentence) {
      const count = sentence.split(" ").length - (expression.split(" ").length / 2)
      const bestSlice = { slice: "", score: 0}
      for (let i = 0; i < count; i++) {
          const slice = sentence.split(" ").slice(i, i + expression.split(" ").length).join(" ")
          const score = this.handleExpressionMatchProcess(expression, slice)
          if (score >= this.PERFECT_SCORE) return slice
          
          if (bestSlice.score < score) {
            bestSlice.slice = slice;
            bestSlice.score = score
          }
      }
      if (bestSlice.score >= this.THRESHOLD) return bestSlice.slice

    }

    handleExpressionMatchProcess (expression, sentence) {

      const matches = expression.split(" ").map( word => ({word, match: this.handleWordMatch(word, sentence)}))

      const score = matches.reduce((acc, curr) => acc + curr.match, 0)

      return score / expression.length
    }

    handleWordMatch(word, sentenceChunk) {
        const offset = word.length > 0 ? word.length - 1 : 0
        const augmentedSentenceChunk = '*'.repeat(offset) + sentenceChunk + '*'.repeat(offset)
        // console.log(augmentedSentenceChunk)
        const count = augmentedSentenceChunk.length - word.length
        let wordMatch = 0

        for (let i = 0; i < count; i++) {
          const slice = augmentedSentenceChunk.slice(i, i + word.length)
          const matches = this.checkMatch(slice, word)
          wordMatch = Math.max(wordMatch, matches)
          if (wordMatch == word.length) return wordMatch
        }

        return wordMatch
    
      }

    checkMatch (slice, word) {
          let matches = 0
          slice.split('').forEach((ch, idx) => {
            matches += word[idx] === ch
          })

          return matches
    }
}

let lastResult: { blanked: string; usedExpressions: string[] } | null = null
let lastCallTime = 0
const DEBOUNCE_DELAY = 1000 // milliseconds

export const handleBlanksGen = (sentence: string, expressions: string[]) => {
  const now = Date.now()
  
  if (now - lastCallTime < DEBOUNCE_DELAY && lastResult) {
    return lastResult
  }
  
  lastCallTime = now
  const processor = new SentenceExpressionMatchProcessor(sentence, expressions)
  
  processor.handleProcess()
  
  lastResult = {
    blanked: processor.sentence,
    usedExpressions: processor.usedExpressions,
  }
  
  return lastResult
}
