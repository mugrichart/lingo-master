
import CreateTopicClient from "@/app/(workspaces)/(solo-player)/topics/create-topic/CreateTopicClient"

import { createTopic } from "@/lib/actions"
import { fetchTopicByID, fetchTopicSuggestions } from "@/lib/data"

const page = async ({ 
  searchParams
}: { searchParams: Promise<{ parentTopic: string}>}) => {

  const topicIDResolved = (await searchParams).parentTopic;
 
  const { topic } = await fetchTopicByID(topicIDResolved)

  const { suggestions } = await fetchTopicSuggestions(topic)

  return (
    <CreateTopicClient suggestions={suggestions} topic={topic} />
  )
}

export default page
