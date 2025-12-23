import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility for Tailwind class merging
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

interface MatchResult {
  blanked: string;
  usedExpressions: string[];
}

export class SentenceExpressionMatchProcessor {
  private readonly THRESHOLD: number = 0.7; // 70/100
  private readonly PERFECT_SCORE: number = 0.9; // 90/100
  private readonly DASH_COUNT: number = 5;
  
  public sentence: string;
  private readonly expressions: string[];
  public usedExpressions: string[];

  constructor(sentence: string, expressions: string[]) {
    this.sentence = sentence;
    this.expressions = expressions;
    this.usedExpressions = [];
  }

  private removePunctuation(str: string): string {
    return str.replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, "");
  }

  public handleProcess(): void {
    // Sort by length descending to match "Cognitive Behavioral Therapy" before "Therapy"
    const sortedExprs = [...this.expressions].sort((a, b) => b.length - a.length);

    for (const expression of sortedExprs) {
      const cleanExpr = this.removePunctuation(expression).toLowerCase();
      const matchedSlice = this.findBestMatchInSentence(cleanExpr);

      if (matchedSlice) {
        // Use a Regex with word boundaries (\b) for short words to prevent matching inside other words
        // e.g., prevents "cat" matching "communicating"
        const needsStrictBoundary = expression.length <= 4;
        const escapedSlice = matchedSlice.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = needsStrictBoundary ? `\\b${escapedSlice}\\b` : escapedSlice;
        
        const regex = new RegExp(pattern, 'gi');
        
        if (regex.test(this.sentence)) {
          this.sentence = this.sentence.replace(regex, '-'.repeat(this.DASH_COUNT));
          this.usedExpressions.push(expression);
        }
      }
    }
  }

  private findBestMatchInSentence(expression: string): string | null {
    const sentenceWords = this.sentence.split(/\s+/);
    const exprWords = expression.split(/\s+/);
    
    // The sliding window size is based on the number of words in the expression
    const windowSize = exprWords.length;
    let bestSlice = { slice: "", score: 0 };

    for (let i = 0; i <= sentenceWords.length - windowSize; i++) {
      const rawSlice = sentenceWords.slice(i, i + windowSize).join(" ");
      const cleanSlice = this.removePunctuation(rawSlice).toLowerCase();
      
      const score = this.calculateSimilarity(expression, cleanSlice);

      if (score >= this.PERFECT_SCORE) return rawSlice;

      if (score > bestSlice.score) {
        bestSlice = { slice: rawSlice, score: score };
      }
    }

    return bestSlice.score >= this.THRESHOLD ? bestSlice.slice : null;
  }

  private calculateSimilarity(expr: string, slice: string): number {
    if (expr === slice) return 1.0;
    
    let matches = 0;
    const length = Math.max(expr.length, slice.length);
    
    // Simple character alignment score
    for (let i = 0; i < Math.min(expr.length, slice.length); i++) {
      if (expr[i] === slice[i]) matches++;
    }

    return matches / length;
  }
}

// Caching/Throttling state
let lastResult: MatchResult | null = null;
let lastCallTime = 0;
let lastInputKey = "";
const THROTTLE_DELAY = 1000;

/**
 * Generates a sentence with blanks based on matching expressions.
 * Note: Uses a throttling strategy with input-key validation.
 */
export const handleBlanksGen = (
  sentence: string, 
  expressions: string[], 
  throttleOn: boolean = true
): MatchResult => {
  const now = Date.now();
  
  // Unique key prevents returning "cat" results when the user is now asking for "dog"
  const currentInputKey = `${sentence}|${expressions.join(",")}`;

  if (
    throttleOn &&
    now - lastCallTime < THROTTLE_DELAY &&
    currentInputKey === lastInputKey &&
    lastResult
  ) {
    return lastResult;
  }

  lastCallTime = now;
  lastInputKey = currentInputKey;

  const processor = new SentenceExpressionMatchProcessor(sentence, expressions);
  processor.handleProcess();

  lastResult = {
    blanked: processor.sentence,
    usedExpressions: processor.usedExpressions,
  };

  return lastResult;
};