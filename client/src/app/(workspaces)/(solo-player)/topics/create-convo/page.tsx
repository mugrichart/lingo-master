
import { fetchConversationSuggestions, fetchTopicByID, fetchWords, expandConversationSuggestion } from "@/lib/data"

import CreateConvoClient from "./CreateConvoClient"

const page = async ({ 
  searchParams
}: { searchParams: Promise<{ topic: string}>}) => {

  const topicIdResolved = (await searchParams).topic;
 
  const topic = await fetchTopicByID(topicIdResolved)

  const words = await fetchWords(topicIdResolved)

  const { conversations } = await fetchConversationSuggestions(topicIdResolved)

  return (
    <CreateConvoClient words={words} topic={topic} suggestions={conversations} expandConversationSuggestion={expandConversationSuggestion}/>
  )
}

export default page
