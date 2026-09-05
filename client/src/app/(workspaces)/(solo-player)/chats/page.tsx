import ChatsClient from "./ChatsClient"
import { mockChats } from "@/lib/chat-data"
import { fetchCharacters, fetchMyLearning } from "@/lib/data"
import { characterToDirectChat } from "@/lib/chat-types"

const ChatsPage = async () => {
  const characters = await fetchCharacters()
  const learnedTopics = await fetchMyLearning()
  const characterChats = characters.map(characterToDirectChat)
  // real contacts first, then the mocked plot/group chats
  return <ChatsClient initialChats={[...characterChats, ...mockChats]} learnedTopics={learnedTopics} />
}

export default ChatsPage
