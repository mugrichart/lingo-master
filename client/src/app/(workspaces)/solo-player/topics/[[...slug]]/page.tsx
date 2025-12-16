import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {TopicList} from "../components/topic"
import {WordList} from "../components/word"

import { fetchTopics, fetchWords } from "@/lib/data"

const page = async ({
  params
}: {
  params: Promise<{ slug?: string[]}>
}
) => {
  const topicChain = (await params).slug
  const topicID = topicChain?.[topicChain.length - 1]

  const { topics } = await fetchTopics(topicID ? { parent : topicID }: {})
  console.log(topicID)
  const { words } = topicID ? await fetchWords(topicID) : { words: [] }
  
  return (
    <Tabs defaultValue="topics" className="w-full h-222">
      {topicID && words?.length > 0 && (
        <TabsList>
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="words">Words({words?.length || 0})</TabsTrigger>
        </TabsList>
        )
      }
      <TabsContent value="topics">
        <TopicList topics={topics} topicID={topicID}/>
      </TabsContent>
      {
        topicID && 
        <TabsContent value="words">
          <WordList words={words} topicID={topicID}/>
        </TabsContent>
      }
  </Tabs>
  )
}

export default page
