
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

import { createTopic } from "@/lib/actions"
import { fetchTopicByID } from "@/lib/data"

const page = async ({ 
  searchParams
}: { searchParams: Promise<{ parentTopic: string}>}) => {

  const topicIDResolved = (await searchParams).parentTopic;
 
  const createTopicWithParentTopicID = createTopic.bind(null, topicIDResolved);

  const { topic } = topicIDResolved ? await fetchTopicByID(topicIDResolved) : { }

  return (
    <div className="w-full flex justify-center items-center py-20">
        <Card className="p-3 w-[500px] py-7 pt-10">
            <CardHeader className="w-full">
                <CardTitle>Create a new {topic ? "subtopic" : "topic"}</CardTitle>
                {topic && 
                  <CardDescription>Under the <em>{topic?.name}</em> topic</CardDescription>
                }
            </CardHeader>

            <CardContent className="flex flex-col gap-4 w-full bg-blue-5">
                <form action={createTopicWithParentTopicID}>
                    <FieldGroup>
                        <Field orientation={"horizontal"}>
                            <Input
                            id="name"
                            type="text"
                            name="name"
                            placeholder="Enter the topic"
                            required
                            />
                    </Field>
                    
                    <Field>
                        <Select name="language">
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select The Language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                <SelectLabel>Language</SelectLabel>
                                    <SelectItem value="english">English</SelectItem>
                                    <SelectItem value="french">French</SelectItem>
                                    <SelectItem value="spanish">Spanish</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </Field>

                    <Field>
                        <Button type="submit">Create</Button>
                    </Field>
                </FieldGroup>
                </form>
            </CardContent>
        </Card>
    </div>
  )
}

export default page
