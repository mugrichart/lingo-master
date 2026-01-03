
import CreateTopicClient from "@/app/(workspaces)/(solo-player)/topics/create-topic/CreateTopicClient"

import { createTopic } from "@/lib/actions"
import { fetchTopicByID, fetchTopicSuggestions } from "@/lib/data"

const page = async ({ 
  searchParams
}: { searchParams: Promise<{ parentTopic: string}>}) => {

  const topicIdResolved = (await searchParams).parentTopic;
 
  const topic = topicIdResolved ? await fetchTopicByID(topicIdResolved) : null

  const { topics } = await fetchTopicSuggestions(topic) 

  return (
    <CreateTopicClient suggestions={topics} topic={topic} />
  )
}

export default page
