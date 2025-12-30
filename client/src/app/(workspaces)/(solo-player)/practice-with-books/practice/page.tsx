import { createPracticeTracking, fetchPracticeBookPage, fetchPracticeData, fetchPracticeTracking } from "@/lib/data"
import PracticeClient from "./PracticeClient"
// import { updatePracticeTracking } from "@/lib/actions"

const page = async ({
    searchParams
}:{
    searchParams: Promise<{bookID: string, page?: number, score?: number}>
}) => {
    const { bookID, page: optionalPageNumber, score } = await searchParams
    const { pageContent, pageNumber } = (await fetchPracticeBookPage(bookID, optionalPageNumber)) ?? {}
    if (!pageContent) {
        let practice = await fetchPracticeData(bookID)
        if (!practice) {
            // create practice plan
            practice = await createPracticePlan(bookID)
        }
        return <div>Error finding practice page</div>
    }
    // await updatePracticeTracking(score)

  return (
    <div className="h-screen">
        <img 
            src="/fire-background.jpg" 
            alt="fire" 
            className="w-full h-full object-cover brightness-[0.08] saturate-[0.6]" 
        />
  
        {/* Your Content Container */}
        <div className="absolute inset-0 w-full h-screen flex justify-center px-10"  id="book">
            <PracticeClient bookID={bookID} page={pageContent} pageNumber={Number(optionalPageNumber ?? pageNumber)} score={Number(score)}/>
        </div>
    </div>
  )
}

export default page