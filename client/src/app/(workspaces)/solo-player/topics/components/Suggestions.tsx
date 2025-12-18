'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SetStateAction, useState } from "react"

import { TopicSuggestion as TopicSuggestionType } from "@/lib/definitions"
import { Button } from "@/components/ui/button"
import { fetchTopicSuggestions } from "@/lib/data"

const TopicSuggestions = ({ initialSuggestions, chooseSuggestion }: { initialSuggestions: TopicSuggestionType[], chooseSuggestion: (s: TopicSuggestionType) => void}) => {
  const [ suggestions, setSuggestions ] = useState(initialSuggestions)

  const handleTopicClick = (ts: TopicSuggestionType) => {
    setSuggestions(suggestions.filter(sugg => sugg !== ts))
    chooseSuggestion(ts)
  }

  return (
    <ul className="flex flex-wrap justify-evenly gap-3">
      {
        suggestions.map(ts => <Button variant="outline" onClick={() => handleTopicClick(ts)}>{ts}</Button>)
      }
    </ul>
  )
}

const SuggestionsPanel = ({ page, initialSuggestions, chooseSuggestion}: { page: "topics" | "words" | "convos", initialSuggestions: TopicSuggestionType[], chooseSuggestion: (s: TopicSuggestionType) => void }) => {
  
  return (
    <Card className="w-100">
        <CardHeader>
            <CardTitle>{page} suggestions</CardTitle>
            <CardDescription>You can pick a suggestion and develop it in the form</CardDescription>
        </CardHeader>
        <CardContent>
          {
            page === "topics" ? <TopicSuggestions initialSuggestions={initialSuggestions} chooseSuggestion={chooseSuggestion}/> : <></>
          }
        </CardContent>
    </Card>
  )
}

export default SuggestionsPanel
