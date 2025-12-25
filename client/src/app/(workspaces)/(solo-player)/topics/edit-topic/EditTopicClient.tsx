'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Topic } from "@/lib/definitions"
import { useActionState } from "react"
import { editTopic } from "@/lib/actions"
import TopicForm from "../components/TopicForm"

const EditTopicClient = ({
    topic,
}:{
    topic: Topic,
}) => {
    const editTopicWithID = editTopic.bind(null, topic._id);
    
    // access action state to know when the server action is pending
    const [errorMessage, formAction, isPending] = useActionState(editTopicWithID, undefined)

  return (
    <div className="w-full flex justify-center py-20">
        <Card className="p-3 w-125 py-7 pt-10 h-fit">
            <CardHeader className="w-full">
                <CardTitle>Edit Topic</CardTitle>
                <CardDescription><em>{topic?.name}</em></CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-4 w-full bg-blue-5">
                <TopicForm action={formAction} isPending={isPending} topicSuggestion={topic} typeOfForm="edit"/>
            </CardContent>

        </Card>
    </div>
  )
}

export default EditTopicClient
