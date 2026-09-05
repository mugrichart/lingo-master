import ChatsClient from "./ChatsClient"
import { fetchCharacters, fetchMyLearning } from "@/lib/data"
import { characterToDirectChat, topicToGroupChat } from "@/lib/chat-types"

const ChatsPage = async () => {
  const characters = await fetchCharacters()
  const learnedTopics = await fetchMyLearning()
  const characterChats = characters.map(characterToDirectChat)
  const groupChats = learnedTopics.map(topicToGroupChat)

  return <ChatsClient initialChats={[...characterChats, ...groupChats]} learnedTopics={learnedTopics} />
}

export default ChatsPage
