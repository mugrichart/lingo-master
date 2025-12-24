'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import SuggestionsPanel from "../components/Suggestions"
import { ConvoSuggestion, Topic, Word } from "@/lib/definitions"
import { useState } from "react"

import { expandConvoSuggestion, expandWordSuggestion } from "@/lib/data"
import CreateConvoForm from "./CreateConvoForm"

const CreateConvoClient =  ({
    words,
    suggestions,
    topic,
}:{
    words: Word[]
    suggestions: ConvoSuggestion[],
    topic: Topic,
}) => {
    const [selectedSuggestion, setSelectedSuggestion] = useState<ConvoSuggestion | null>(null)

    async function expandWithAI () {
        const { detailedSuggestion } = await expandConvoSuggestion(topic.name, selectedSuggestion as ConvoSuggestion)
        setSelectedSuggestion(detailedSuggestion)
    }
 
  return (
    <div className="w-full flex justify-center gap-10 py-20">
        <Card className="p-3 w-125 py-7 pt-10 h-fit">
            <CardHeader className="w-full">
                <CardTitle>Create a new conversation</CardTitle>
                <CardDescription>Under the <em>{topic?.name}</em> topic</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 w-full">
                 <CreateConvoForm words={words} topicID={topic._id} convoSuggestion={selectedSuggestion} resetForm={() => setSelectedSuggestion(null)} developWithAI={expandWithAI}/>
            </CardContent>
        </Card>
        <SuggestionsPanel words={words} page="convos" initialSuggestions={suggestions} chooseSuggestion={setSelectedSuggestion}/>
    </div>
  )
}

export default CreateConvoClient
