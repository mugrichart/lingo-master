import { fetchConversations, fetchWords } from "@/lib/data"
import { Conversation } from "@/lib/definitions"
import ConversationPracticeClient from "@/components/ConversationPracticeClient"
import { range, shuffleArray } from "@/lib/utils/shuffle"

const page = async ({ searchParams }: { searchParams: Promise<{ topic: string, conversation: string }>}) => {
	const { topic, conversation } = await searchParams

	const conversations = topic ? await fetchConversations(topic) : []
	const conversationObject: Conversation | undefined = conversations.find((c: any) => c._id === conversation)
	const words = topic ? await fetchWords(topic) : []

	if (!conversationObject) {
		return <div className="p-8">Conversation not found</div>
	}

	return (
		<div className="w-full flex justify-center items-start py-10">
			<ConversationPracticeClient conversation={conversationObject} words={words} />
		</div>
	)
}

export default page

