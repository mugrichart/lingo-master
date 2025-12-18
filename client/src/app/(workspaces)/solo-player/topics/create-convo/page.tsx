import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Field,
  FieldGroup,
} from "@/components/ui/field"

import { Button } from "@/components/ui/button"

import { createConversation } from "@/lib/actions"
import { fetchTopicByID, fetchWords } from "@/lib/data"
import { Plus } from "lucide-react"

import ConversationFormClient from "@/components/ConversationFormClient"

const page = async ({ 
  searchParams
}: { searchParams: Promise<{ topic: string}>}) => {

  const topicIDResolved = (await searchParams).topic;
 
  const createConversationWithTopicID = createConversation.bind(null, topicIDResolved);

  const { topic } = topicIDResolved ? await fetchTopicByID(topicIDResolved) : { }

  const { words } = await fetchWords(topicIDResolved)

  return (
    <div className="w-full flex justify-center items-center py-20">
        <Card className="p-3 w-125 py-7 pt-10">
            <CardHeader className="w-full">
                <CardTitle>Create a new conversation</CardTitle>
                <CardDescription>Under the <em>{topic?.name}</em> topic</CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-4 w-full bg-blue-5">
                {/* keep the server action on the form */}
                <form action={createConversationWithTopicID}>
                    <FieldGroup>
                        {/* ConversationFormClient renders character inputs, line rows and submit button */}
                        <ConversationFormClient words={words}/>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    </div>
  )
}

export default page
