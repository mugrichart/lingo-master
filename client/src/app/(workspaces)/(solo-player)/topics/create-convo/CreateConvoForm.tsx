'use client'

import {
    Field,
  FieldGroup,
} from "@/components/ui/field"


import { createConversation, createWord } from "@/lib/actions"
import { useActionState, useEffect } from "react"
import { ConvoSuggestion, Word } from "@/lib/definitions"
import ConversationFormClient from "@/components/ConversationFormClient"
import { Button } from "@/components/ui/button"
import { Wand2 } from "lucide-react"

function CreateConvoForm ({
    words,
    convoSuggestion,
    developWithAI,
    topicID,
    resetForm
}:{
    words: Word[],
    convoSuggestion: ConvoSuggestion | null,
    developWithAI: () => void
    topicID: string,
    resetForm: () => void
}) {
    const createConversationWithTopicID = createConversation.bind(null, topicID);
    
    // access action state to know when the server action is pending
    const [errorMessage, formAction, isPending] = useActionState(createConversationWithTopicID, undefined)

    useEffect(() => {
        if (!isPending && errorMessage === undefined) {
            resetForm()
        }
    }, [isPending, errorMessage])

  return (
    <form action={formAction}>
        <FieldGroup>
            {/* ConversationFormClient renders character inputs, line rows and submit button */}
            <ConversationFormClient words={words} convoSuggestion={convoSuggestion}/>
        </FieldGroup>

        <FieldGroup>
            <Field>
                { convoSuggestion && 
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

export default CreateConvoForm
