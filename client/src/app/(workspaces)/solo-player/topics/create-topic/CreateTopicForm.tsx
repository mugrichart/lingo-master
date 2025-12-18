'use client'
import { Input } from "@/components/ui/input"
import { useRef, useActionState, useEffect, useState } from "react"

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



function CreateTopicForm ({
    topicSuggestion,
    topicID,
    resetForm
}:{
    topicSuggestion: string | null,
    topicID: string,
    resetForm: () => void
}) {
    const createTopicWithParentTopicID = createTopic.bind(null, topicID);

    // access action state to know when the server action is pending
    const [errorMessage, formAction, isPending] = useActionState(createTopicWithParentTopicID, undefined)

    useEffect(() => {
        if (!isPending && errorMessage === undefined) {
            resetForm()
        }
    }, [isPending, errorMessage])


  return (
        <form key={topicSuggestion} action={formAction}>
            <FieldGroup>
                <Field orientation={"horizontal"}>
                        <Input
                        id="name"
                        type="text"
                        name="name"
                        placeholder="Enter the topic"
                        defaultValue={topicSuggestion ?? ""}
                        required
                        />
                </Field>
            
                <Field>
                    <Select name="language">
                        <SelectTrigger className="w-45">
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
                    <Button type="submit" disabled={isPending}>
                      {isPending ? "Submitting..." : "Create"}
                    </Button>
                </Field>
            </FieldGroup>
        </form>
  )
}

export default CreateTopicForm
