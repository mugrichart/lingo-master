
import CreateTopicClient from "@/app/(workspaces)/(solo-player)/topics/create-topic/CreateTopicClient"

import { createTopic } from "@/lib/actions"
import { fetchTopicByID, fetchTopicSuggestions } from "@/lib/session-data"

const page = async ({ 
  searchParams
}: { searchParams: Promise<{ parentTopic: string}>}) => {

  const topicIDResolved = (await searchParams).parentTopic;
 
  const topic = topicIDResolved ? await fetchTopicByID(topicIDResolved) : null

  const { topics } = await fetchTopicSuggestions(topic) 

  return (
    <CreateTopicClient suggestions={topics} topic={topic} />
  )
}

export default page
