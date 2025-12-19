'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import SuggestionsPanel from "../components/Suggestions"
import CreateWordForm from "./CreateWordForm"
import { Topic, Word, WordSuggestion } from "@/lib/definitions"
import { useState } from "react"

import { expandWordSuggestion } from "@/lib/data"

const CreateWordClient =  ({
    suggestions,
    topic,
}:{
    suggestions: WordSuggestion[],
    topic: Topic,
}) => {
    const [selectedSuggestion, setSelectedSuggestion] = useState<Partial<Word> | null>(null)

    async function expandWithAI () {
        const { detailedSuggestion } = await expandWordSuggestion(selectedSuggestion?.word!, selectedSuggestion?.example!)
        setSelectedSuggestion(detailedSuggestion)
    }
 
  return (
    <div className="w-full flex justify-center gap-10 py-20">
        <SuggestionsPanel page="words" initialSuggestions={suggestions} chooseSuggestion={setSelectedSuggestion}/>
        <Card className="p-3 w-125 py-7 pt-10 h-fit">
            <CardHeader className="w-full">
                <CardTitle>Create a new word</CardTitle>
                <CardDescription>Under the <em>{topic?.name}</em> topic</CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-4 w-full bg-blue-5">
                 <CreateWordForm topicID={topic._id} wordSuggestion={selectedSuggestion} resetForm={() => setSelectedSuggestion(null)} developWithAI={expandWithAI}/>
            </CardContent>
        </Card>
    </div>
  )
}

export default CreateWordClient
