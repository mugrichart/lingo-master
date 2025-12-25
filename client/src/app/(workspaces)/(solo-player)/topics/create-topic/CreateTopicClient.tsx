'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Topic, TopicSuggestion } from "@/lib/definitions"
import SuggestionsPanel from "@/app/(workspaces)/(solo-player)/topics/components/Suggestions"
import { useActionState, useEffect, useState } from "react"
import { createTopic } from "@/lib/actions"
import TopicForm from "../components/TopicForm"

const CreateTopicClient = ({
    suggestions,
    topic,
}:{
    suggestions: TopicSuggestion[],
    topic: Topic,
}) => {
    const createTopicWithParentTopicID = createTopic.bind(null, topic?._id);
    const [selectedSuggestion, setSelectedSuggestion] = useState<TopicSuggestion | null>(null)
    
    // access action state to know when the server action is pending
    const [errorMessage, formAction, isPending] = useActionState(createTopicWithParentTopicID, undefined)

    useEffect(() => {
        if (!isPending && errorMessage === undefined) {
            setSelectedSuggestion(null)
    }
    }, [isPending, errorMessage])

  return (
    <div className="w-full flex justify-center gap-10 py-20">
        <Card className="p-3 w-125 py-7 pt-10 h-fit">
            <CardHeader className="w-full">
                <CardTitle>Create a new {topic ? "subtopic" : "topic"}</CardTitle>
                {topic && 
                  <CardDescription>Under the <em>{topic?.name}</em> topic</CardDescription>
                }
            </CardHeader>

            <CardContent className="flex flex-col gap-4 w-full bg-blue-5">
                <TopicForm action={formAction} isPending={isPending} topicSuggestion={selectedSuggestion as TopicSuggestion} typeOfForm="create"/>
            </CardContent>

        </Card>
        <SuggestionsPanel page="topics" initialSuggestions={suggestions} chooseSuggestion={setSelectedSuggestion}/>
    </div>
  )
}

export default CreateTopicClient
