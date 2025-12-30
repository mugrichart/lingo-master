
import { expandWordSuggestion, fetchTopicByID, fetchWordSuggestions } from "@/lib/data"
import CreateWordClient from "./CreateWordClient"
import { WordSuggestion } from "@/lib/definitions";

const page = async ({ 
  searchParams
}: { searchParams: Promise<{ topic: string}>}) => {

    const topicIDResolved = (await searchParams).topic;
    const topic = await fetchTopicByID(topicIDResolved)
    const { words: suggestions } = await fetchWordSuggestions(topic)

  return (
    <CreateWordClient suggestions={suggestions} topic={topic} expandWordSuggestion={expandWordSuggestion}/>
  )
}

export default page
