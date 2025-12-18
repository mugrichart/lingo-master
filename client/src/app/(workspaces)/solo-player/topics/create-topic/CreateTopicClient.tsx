'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import CreateTopicForm from "./CreateTopicForm"
import { Topic, TopicSuggestion } from "@/lib/definitions"
import SuggestionsPanel from "@/app/(workspaces)/solo-player/topics/components/Suggestions"
import { useState } from "react"

const CreateTopicClient = ({
    suggestions,
    topic,
}:{
    suggestions: TopicSuggestion[],
    topic: Topic,
}) => {
    const [selectedSuggestion, setSelectedSuggestion] = useState<TopicSuggestion | null>(null)

  return (
    <div className="w-full flex justify-center gap-10 py-20">
        <SuggestionsPanel page="topics" initialSuggestions={suggestions} chooseSuggestion={setSelectedSuggestion}/>
        <Card className="p-3 w-125 py-7 pt-10 h-fit">
            <CardHeader className="w-full">
                <CardTitle>Create a new {topic ? "subtopic" : "topic"}</CardTitle>
                {topic && 
                  <CardDescription>Under the <em>{topic?.name}</em> topic</CardDescription>
                }
            </CardHeader>

            <CardContent className="flex flex-col gap-4 w-full bg-blue-5">
                <CreateTopicForm topicSuggestion={selectedSuggestion} resetForm={() => setSelectedSuggestion(null)} topicID={topic._id}/>
            </CardContent>

        </Card>
    </div>
  )
}

export default CreateTopicClient
