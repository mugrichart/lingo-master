
import { fetchConversationSuggestions, fetchTopicByID, fetchWords } from "@/lib/session-data"

import CreateConvoClient from "./CreateConvoClient"

const page = async ({ 
  searchParams
}: { searchParams: Promise<{ topic: string}>}) => {

  const topicIDResolved = (await searchParams).topic;
 
  const topic = await fetchTopicByID(topicIDResolved)

  const words = await fetchWords(topicIDResolved)

  const { conversations } = await fetchConversationSuggestions(topicIDResolved)

  return (
    <CreateConvoClient words={words} topic={topic} suggestions={conversations}/>
  )
}

export default page
