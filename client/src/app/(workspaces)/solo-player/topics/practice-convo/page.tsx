import { fetchConvos, fetchWords } from "@/lib/data"
import { Convo } from "@/lib/definitions"
import ConversationPracticeClient from "@/components/ConversationPracticeClient"

const page = async ({ searchParams }: { searchParams: Promise<{ topic: string, convo: string }>}) => {
	const { topic, convo } = await searchParams

	const { convos } = topic ? await fetchConvos(topic) : { convos: [] }
	const convoObj: Convo | undefined = convos.find((c: any) => c._id === convo)
	const { words } = topic ? await fetchWords(topic) : { words: [] }

	if (!convoObj) {
		return <div className="p-8">Conversation not found</div>
	}

	return (
		<div className="w-full flex justify-center items-start py-10">
			<ConversationPracticeClient convo={convoObj} words={words} />
		</div>
	)
}

export default page

