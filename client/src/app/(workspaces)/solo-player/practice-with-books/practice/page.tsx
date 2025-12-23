import { fetchPracticeBookPage, fetchPracticeTracking } from "@/lib/session-data"
import PracticeClient from "./PracticeClient"
import { updatePracticeTracking } from "@/lib/actions"

const page = async ({
    searchParams
}:{
    searchParams: Promise<{bookID: string, page?: number, score?: number}>
}) => {
    const { bookID, page: pageNumber, score: sc } = await searchParams
    const { page, cursorAt } = await fetchPracticeBookPage(bookID, pageNumber)
    const score = sc || ((await fetchPracticeTracking()).practiceTracking).score;
    await updatePracticeTracking(score)

  return (
    <div className="h-screen">
        <img 
            src="/fire-background.jpg" 
            alt="fire" 
            className="w-full h-full object-cover brightness-[0.08] saturate-[0.6]" 
        />
  
        {/* Gradient Overlay to fade the fire into the background */}
        {/* <div className="absolute inset-0 bg-linear-to-b via-transparent" /> */}

        {/* Your Content Container */}
        <div className="absolute inset-0 w-full h-screen flex justify-center px-10"  id="book">
            <PracticeClient bookID={bookID} page={page} pageNumber={Number(pageNumber ?? cursorAt)} score={Number(score)}/>
        </div>
    </div>
  )
}

export default page