import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {TopicList} from "../components/topic"
import {WordList} from "../components/word"

// import { fetchConvos, fetchWords } from "@/lib/session-data"
import { fetchTopics, fetchWords } from "@/lib/session-data"
import { ConvosList } from "../components/convos"

const page = async ({
  params,
  searchParams
}: {
  params: Promise<{ slug?: string[]}>,
  searchParams: Promise<{ tab?: "topics" | "words" }>,
}
) => {
  const topicChain = (await params).slug
  const topicID = topicChain?.[topicChain.length - 1]

  const tab = (await searchParams).tab || "topics"

  const topics = await fetchTopics({ parent : topicID || null })
  const words = topicID ? await fetchWords(topicID) : []
  // const { convos } = topicID ? await fetchConvos(topicID) : { convos: []}
  
  return (
    <Tabs defaultValue={tab} className="w-full h-222 pl-4">
      {topicID && (
        <TabsList>
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="words">Words({words?.length || 0})</TabsTrigger>
          {/*<TabsTrigger value="convos">Convos({convos?.length || 0})</TabsTrigger> */}
        </TabsList>
        )
      }
      <TabsContent value="topics">
        <TopicList topics={topics || []} topicID={topicID}/>
      </TabsContent>
      {
        topicID && 
        <TabsContent value="words">
          <WordList words={words} topicID={topicID}/>
        </TabsContent>
      }
      {/*<TabsContent value="convos">
        <ConvosList words={words} topicID={topicID} convos={convos}/>
      </TabsContent> */}
  </Tabs>
  )
}

export default page
