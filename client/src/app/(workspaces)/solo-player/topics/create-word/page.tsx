
import { fetchTopicByID, fetchWordSuggestions } from "@/lib/data"
import CreateWordClient from "./CreateWordClient"

const page = async ({ 
  searchParams
}: { searchParams: Promise<{ topic: string}>}) => {

    const topicIDResolved = (await searchParams).topic;
   
    const { topic } = await fetchTopicByID(topicIDResolved)
    console.log(topic)
    const { suggestions } = await fetchWordSuggestions(topic)

    
  return ( 
    <CreateWordClient suggestions={suggestions} topic={topic} />
  )
}

export default page
