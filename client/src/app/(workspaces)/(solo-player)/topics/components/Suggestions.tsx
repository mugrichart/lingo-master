'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"

import { ConvoSuggestion, TopicSuggestion as TopicSuggestionType, Word, WordSuggestion } from "@/lib/definitions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type TopicsProps = {
  initialSuggestions: TopicSuggestionType[];
  chooseSuggestion: (s: TopicSuggestionType) => void;
};

type WordsProps = {
  initialSuggestions: WordSuggestion[];
  chooseSuggestion: (s: WordSuggestion) => void;
};

type ConvosProps = { 
  initialSuggestions: ConvoSuggestion[]; 
  chooseSuggestion: (s: ConvoSuggestion) => void 
};

const TopicSuggestions = ({ initialSuggestions, chooseSuggestion }: TopicsProps) => {
  const [ suggestions, setSuggestions ] = useState(initialSuggestions)

  const handleTopicClick = (ts: TopicSuggestionType) => {
    setSuggestions(suggestions.filter(sugg => sugg !== ts))
    chooseSuggestion(ts)
  }

  return (
    <ul className="flex flex-wrap gap-3">
      {
        suggestions.map(ts => <Button variant="outline" onClick={() => handleTopicClick(ts)}>{ts}</Button>)
      }
    </ul>
  )
}

const WordSuggestions = ({ initialSuggestions, chooseSuggestion }: WordsProps) => {
  const [ suggestions, setSuggestions ] = useState(initialSuggestions)

  const handleTopicClick = (ws: WordSuggestion) => {
    setSuggestions(suggestions.filter(sugg => sugg !== ws))
    chooseSuggestion(ws)
  }

  return (
    <ul className="flex flex-wrap gap-3">
      {
        suggestions.map(ws => (
          <Card className="w-90" onClick={() => handleTopicClick(ws)}>
            <CardHeader>
              <CardTitle>{ws.word}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              { ws.example}
            </CardContent>
            <CardFooter>
              <Button>Expand</Button>
            </CardFooter>
          </Card>
          )
        )
      }
    </ul>
  )
}

const ConvoSuggestions =  ({ initialSuggestions, chooseSuggestion }: { initialSuggestions: ConvoSuggestion[], chooseSuggestion: (s: ConvoSuggestion) => void}) => {
  const [ suggestions, setSuggestions ] = useState(initialSuggestions)

  const handleTopicClick = (cs: ConvoSuggestion) => {
    setSuggestions(suggestions.filter(sugg => sugg !== cs))
    chooseSuggestion(cs)
  }

  return (
    <ul className="flex flex-wrap gap-3">
      {
        suggestions.map(cs => (
          <Card className="w-90" onClick={() => handleTopicClick(cs)}>
            <CardHeader>
              <CardTitle>{cs.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              { cs.description}
              <ul className="pt-2 flex flex-wrap gap-1"> { cs?.suggestedWords?.map(sw => <Badge variant="secondary">{sw}</Badge>) }</ul>
            </CardContent>
            <CardFooter>
              <Button>Expand</Button>
            </CardFooter>
          </Card>
          )
        )
      }
    </ul>
  )

}



const SuggestionsPanel = (
  props:
    {page: "topics"} & TopicsProps | 
    {page: "words"} & WordsProps | 
    {page: "convos", words: Word[]} & ConvosProps
  
) => {
  return (
    <Card className="w-200">
        <CardHeader>
            <CardTitle>{props.page} suggestions</CardTitle>
            <CardDescription>Pick a suggestion to expand on it in the form</CardDescription>
        </CardHeader>
        <CardContent>
          {
            props.page === "convos" && 
            <div>
              <label className="text-sm font-medium">Key words: </label>
              <ul className="flex flex-wrap gap-1 mt-2 mb-5">{props.words.map(w => <Badge variant="secondary">{w.word}</Badge>)}</ul>
            </div>
          }
          {props.page === "topics" && (
            <TopicSuggestions 
                initialSuggestions={props.initialSuggestions} 
                chooseSuggestion={props.chooseSuggestion}
            />
          )}
          {props.page === "words" && (
            <WordSuggestions 
                initialSuggestions={props.initialSuggestions} 
                chooseSuggestion={props.chooseSuggestion}
            />
          )}
          {props.page === "convos" && (
            <ConvoSuggestions
              initialSuggestions={props.initialSuggestions}
              chooseSuggestion={props.chooseSuggestion}
            />
          )}
        </CardContent>
    </Card>
  );
};

export default SuggestionsPanel
