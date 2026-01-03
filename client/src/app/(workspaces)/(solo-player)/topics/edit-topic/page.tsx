
import { fetchTopicByID } from "@/lib/data"
import EditTopicClient from "./EditTopicClient";

const page = async ({ 
  searchParams
}: { searchParams: Promise<{ topicId: string}>}) => {

  const topicIdResolved = (await searchParams).topicId;
 
  const topic = await fetchTopicByID(topicIdResolved)

  return (
    <EditTopicClient topic={topic} />
  )
}

export default page
