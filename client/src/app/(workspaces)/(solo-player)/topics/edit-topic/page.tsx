
import { fetchTopicByID } from "@/lib/data"
import EditTopicClient from "./EditTopicClient";

const page = async ({ 
  searchParams
}: { searchParams: Promise<{ topicID: string}>}) => {

  const topicIDResolved = (await searchParams).topicID;
 
  const { topic } = await fetchTopicByID(topicIDResolved)

  return (
    <EditTopicClient topic={topic} />
  )
}

export default page
