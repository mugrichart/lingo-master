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
import { Input } from "@/components/ui/input"
import { Topic, TopicSuggestion } from "@/lib/definitions"

const TopicForm = <T extends "create" | "edit">({
    action,
    typeOfForm,
    topicSuggestion,
    isPending

}: {
    action: (payload: FormData) => void,
    typeOfForm: T,
    topicSuggestion: T extends "create" ? TopicSuggestion : Topic
    isPending: boolean
}) => {
  return (
    <form key={typeOfForm === "create" ? (topicSuggestion as string) : (topicSuggestion as Topic)._id} action={action}>
        <FieldGroup>
            <Field orientation={"horizontal"}>
                <Input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Enter the topic"
                    defaultValue={typeOfForm === "create" ? (topicSuggestion as TopicSuggestion ?? "") : (topicSuggestion as Topic).name}
                    required
                />
            </Field>
        
            <Field>
                <Select name="language" defaultValue={(topicSuggestion as Topic)?.language}>
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
                    {isPending ? "Submitting..." : "Submit"}
                </Button>
            </Field>
        </FieldGroup>
    </form>
  )
}

export default TopicForm
