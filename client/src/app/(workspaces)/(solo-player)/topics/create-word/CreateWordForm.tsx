'use client'

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

import { createWord } from "@/lib/actions"
import { useActionState, useEffect } from "react"
import { WordSuggestion } from "@/lib/definitions"
import { Wand2 } from "lucide-react"

function CreateWordForm ({
    wordSuggestion,
    developWithAI,
    topicID,
    resetForm
}:{
    wordSuggestion: WordSuggestion | null,
    developWithAI: () => void
    topicID: string,
    resetForm: () => void
}) {
    const createWordWithTopicID = createWord.bind(null, topicID);

    // access action state to know when the server action is pending
    const [errorMessage, formAction, isPending] = useActionState(createWordWithTopicID, undefined)

    useEffect(() => {
        if (!isPending && errorMessage === undefined) {
            resetForm()
        }
    }, [isPending, errorMessage])

  return (
    <form action={formAction}>
        <FieldGroup>
            <Field orientation={"horizontal"}>
                <Input
                id="word"
                type="text"
                name="word"
                placeholder="the word"
                defaultValue={wordSuggestion?.word ?? ""}
                required
                />
            </Field>
                    
            <Field>
                <Select name="type" defaultValue={wordSuggestion?.type} key={wordSuggestion?.type}>
                    <SelectTrigger className="w-45">
                        <SelectValue placeholder="Select The Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                        <SelectLabel>Type</SelectLabel>
                            <SelectItem value="verb">Verb</SelectItem>
                            <SelectItem value="noun">Noun</SelectItem>
                            <SelectItem value="adjective">Adjective</SelectItem>
                            <SelectItem value="adverb">Adverb</SelectItem>
                            <SelectItem value="idiom">Idiom</SelectItem>
                            <SelectItem value="expression">Expression</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </Field>

            <Field>
                <Select name="language style" defaultValue={wordSuggestion?.["language style"]} key={wordSuggestion?.["language style"]}>
                    <SelectTrigger className="w-45">
                        <SelectValue placeholder="Select The Style" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                        <SelectLabel>Language Style</SelectLabel>
                            <SelectItem value="formal">Formal</SelectItem>
                            <SelectItem value="informal">Informal</SelectItem>
                            <SelectItem value="neutral">Neutral</SelectItem>
                            <SelectItem value="colloquial">Colloquial</SelectItem>
                            <SelectItem value="slang">Slang</SelectItem>
                            <SelectItem value="jargon">Jargon</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </Field>

            <Field>
                <Input
                id="meaning"
                type="text"
                name="meaning"
                defaultValue={wordSuggestion?.meaning}
                placeholder="Fill with the meaning"
                required
                />
            </Field>

            <Field>
                <Input
                id="example"
                type="text"
                name="example"
                defaultValue={wordSuggestion?.example ?? ""}
                placeholder="Fill with an example sentence"
                required
                />
            </Field>

            <Field>
                <Input
                id="synonym"
                type="text"
                name="synonym"
                defaultValue={wordSuggestion?.synonym}
                placeholder="Fill with a synonym"
                required
                />
            </Field>
            
            <Field>
                <Input
                id="antonym"
                type="text"
                name="antonym"
                defaultValue={wordSuggestion?.antonym}
                placeholder="Fill with an antonym"
                required
                />
            </Field>

            <Field>
                { wordSuggestion && 
                    <Button type="button" variant="outline" onClick={developWithAI}>
                        Expand with AI <Wand2 />
                    </Button>
                }
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Submitting..." : "Create"}
                </Button>
            </Field>
        </FieldGroup>
    </form>
  )
}

export default CreateWordForm
