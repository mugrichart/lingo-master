'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import SuggestionsPanel from "../components/Suggestions"
import { ConvoSuggestion, ExpandedSuggestion, Topic, Word } from "@/lib/definitions"
import { useEffect, useState } from "react"

import CreateConvoForm from "./CreateConvoForm"

const CreateConvoClient =  ({
    words,
    suggestions,
    topic,
    expandConversationSuggestion
}:{
    words: Word[]
    suggestions: ConvoSuggestion[],
    topic: Topic,
    expandConversationSuggestion: (t: string, sugg: ConvoSuggestion) => Promise<Partial<ExpandedSuggestion>>
}) => {
    
    const [selectedSuggestion, setSelectedSuggestion] = useState<ConvoSuggestion | null>(null)
    const [expandedSuggestion, setExpandedSuggestion] = useState<Partial<ExpandedSuggestion> | null>(null)

    async function expandWithAI () {
        const detailedSuggestion = await expandConversationSuggestion(topic.name, selectedSuggestion as ConvoSuggestion)
        setExpandedSuggestion(detailedSuggestion)
    }

    useEffect(() => {
        if (selectedSuggestion) {
            setExpandedSuggestion(selectedSuggestion)
        }
    }, [selectedSuggestion])
 
  return (
    <div className="w-full flex justify-center gap-10 py-20">
        <Card className="p-3 w-125 py-7 pt-10 h-fit">
            <CardHeader className="w-full">
                <CardTitle>Create a new conversation</CardTitle>
                <CardDescription>Under the <em>{topic?.name}</em> topic</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 w-full">
                 <CreateConvoForm words={words} topicID={topic._id} convoSuggestion={ expandedSuggestion } resetForm={() => setExpandedSuggestion(null)} developWithAI={expandWithAI}/>
            </CardContent>
        </Card>
        <SuggestionsPanel words={words} page="convos" initialSuggestions={suggestions} chooseSuggestion={setSelectedSuggestion}/>
    </div>
  )
}

export default CreateConvoClient
