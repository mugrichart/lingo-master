import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {TopicList} from "../components/topic"
import {WordList} from "../components/word"

import { fetchTopics } from "@/lib/data"

const page = async ({
  params
}: {
  params: Promise<{ slug?: string[]}>
}
) => {
  const topicChain = (await params).slug
  const topicID = topicChain?.[topicChain.length - 1]

  const { topics } = await fetchTopics(topicID ? { parent : topicID }: {})

  console.log(topicID, topics)

  return (
    <Tabs defaultValue="topics" className="w-full h-222">
      <TabsList>
        <TabsTrigger value="topics">Topics</TabsTrigger>
        <TabsTrigger value="words">Words</TabsTrigger>
      </TabsList>
      <TabsContent value="topics">
        <TopicList topics={topics}/>
      </TabsContent>
      <TabsContent value="words">
        <WordList />
      </TabsContent>
  </Tabs>
  )
}

export default page
