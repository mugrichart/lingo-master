
import { createConversation } from "@/lib/actions"
import { fetchConvoSuggestions, fetchTopicByID, fetchWords } from "@/lib/data"

import CreateConvoClient from "./CreateConvoClient"

const page = async ({ 
  searchParams
}: { searchParams: Promise<{ topic: string}>}) => {

  const topicIDResolved = (await searchParams).topic;
 
  const { topic } = await fetchTopicByID(topicIDResolved)

  const { words } = await fetchWords(topicIDResolved)

  const { suggestions } = await fetchConvoSuggestions(topic, words)

  return (
    <CreateConvoClient words={words} topic={topic} suggestions={suggestions}/>
  )
}

export default page
