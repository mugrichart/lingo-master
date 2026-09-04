import { fetchTopicByID, fetchWords } from "@/lib/data"
import LearnClient from "./LearnClient"
import { redirect } from "next/navigation"

const page = async ({
  searchParams
}: {
  searchParams: Promise<{ topic?: string }>
}) => {
  const topicId = (await searchParams).topic
  if (!topicId) redirect('/topics')

  const [topic, words] = await Promise.all([
    fetchTopicByID(topicId),
    fetchWords(topicId)
  ])

  if (!words?.length) redirect(`/topics/${topicId}?tab=words`)

  return (
    <div className="w-full h-full pl-4">
      <LearnClient topic={topic} words={words} />
    </div>
  )
}

export default page
