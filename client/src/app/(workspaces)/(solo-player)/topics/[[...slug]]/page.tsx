import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {TopicList} from "../components/topic"
import {WordList} from "../components/word"

// import { fetchConvos, fetchWords } from "@/lib/data"
import { fetchConversations, fetchTopics, fetchWords, fetchTopicMastery } from "@/lib/data"
import { fetchTopicMasteryBadge } from "@/lib/mastery"
import { ConvosList } from "../components/convos"
import { Conversation } from "@/lib/definitions"

const page = async ({
  params,
  searchParams
}: {
  params: Promise<{ slug?: string[]}>,
  searchParams: Promise<{ tab?: "topics" | "words" }>,
}
) => {
  const topicChain = (await params).slug
  const topicId = topicChain?.[topicChain.length - 1]

  const tab = (await searchParams).tab || "topics"

  const topics = await fetchTopics({ parent : topicId || null })
  const words = topicId ? await fetchWords(topicId) : []
  const conversations = topicId ? await fetchConversations(topicId) : []
  const { mastery, learned } = topicId
    ? await fetchTopicMastery(topicId)
    : { mastery: null, learned: false }

  // resolve each visible topic's aggregated mastery in parallel (backend-cached per node)
  const masteryById: Record<string, number | null> = Object.fromEntries(
    await Promise.all(
      (topics || []).map(async t => [t._id, await fetchTopicMasteryBadge(t._id)] as const)
    )
  )

  return (
    <Tabs defaultValue={tab} className="w-full h-222 pl-4">
      {topicId && (
        <TabsList>
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="words">Words({words?.length || 0})</TabsTrigger>
          <TabsTrigger value="conversations">Conversations({conversations?.length || 0})</TabsTrigger>
        </TabsList>
        )
      }
      <TabsContent value="topics">
        <TopicList topics={topics || []} topicId={topicId} words={words} masteryById={masteryById}/>
      </TabsContent>
      {
        topicId && 
        <TabsContent value="words">
          <WordList words={words} topicId={topicId} mastery={mastery} learned={learned}/>
        </TabsContent>
      }
      <TabsContent value="conversations">
        <ConvosList words={words} topicId={topicId} conversations={conversations as Conversation[]}/>
      </TabsContent>
  </Tabs>
  )
}

export default page
