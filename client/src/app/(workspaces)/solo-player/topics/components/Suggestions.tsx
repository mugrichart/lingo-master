'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"

import { TopicSuggestion as TopicSuggestionType, WordSuggestion } from "@/lib/definitions"
import { Button } from "@/components/ui/button"

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

const WordSuggestions = ({ initialSuggestions, chooseSuggestion }: { initialSuggestions: WordSuggestion[], chooseSuggestion: (s: WordSuggestion) => void}) => {
  const [ suggestions, setSuggestions ] = useState(initialSuggestions)

  const handleTopicClick = (ws: WordSuggestion) => {
    setSuggestions(suggestions.filter(sugg => sugg !== ws))
    chooseSuggestion(ws)
  }

  return (
    <ul className="flex flex-wrap justify-evenly gap-3">
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

type TopicsProps = {
  page: "topics";
  initialSuggestions: TopicSuggestionType[];
  chooseSuggestion: (s: TopicSuggestionType) => void;
};

type WordsProps = {
  page: "words";
  initialSuggestions: WordSuggestion[];
  chooseSuggestion: (s: WordSuggestion) => void;
};

//! Add "convos" here later...
type ConvosProps = { 
  page: "convos"; 
  initialSuggestions: any[]; 
  chooseSuggestion: (s: any) => void 
};

type SuggestionsPanelProps = TopicsProps | WordsProps | ConvosProps;

const SuggestionsPanel = (props: SuggestionsPanelProps) => {
  return (
    <Card className="w-200">
        <CardHeader>
            <CardTitle>{props.page} suggestions</CardTitle>
            <CardDescription>Pick a suggestion to expand on it in the form</CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
    </Card>
  );
};

export default SuggestionsPanel
