import { 
    createPracticeBookPage, 
    createPracticePlan, 
    createPracticeTracking, 
    fetchPracticeBookPage, 
    fetchPracticePlan, 
    fetchPracticeTracking 
} from "@/lib/data"

import PracticeClient from "./PracticeClient"
import { updatePracticeTracking } from "@/lib/actions"

const page = async ({
    searchParams
}:{
    searchParams: Promise<{bookID: string, page?: number, score?: number, topicId?: string, wordsPerPage?: number}>
}) => {
    const { bookID, page: optionalPageNumber, score: optionalScore, topicId, wordsPerPage } = await searchParams
    let [practicePlan, practicePage] = await Promise.all([fetchPracticePlan(bookID), fetchPracticeBookPage(bookID, optionalPageNumber)])
    if (!practicePage) {
        console.warn("Couldn't find the practice page")
        if (!practicePlan) {
            console.warn("Couldn't find the practice plan either...Attempting to create one") //! So make sure you don't duplicate it in case of errors
            practicePlan = await createPracticePlan(bookID)
            console.log("Practice plan: ", practicePlan)
        } 
        if (!practicePlan) return <div>Error creating practice page</div>
        // Creating the page when we have the practice plan
        console.warn('Creating practice page....')
        practicePage = await createPracticeBookPage(bookID, { pageNumber: optionalPageNumber, topicId, wordsPerPage }) //! Make sure you don't do this at the end of the book
        if (!practicePage) return <div>Error finding practice page</div>
    }
    
    let score = optionalScore
    if (score) {
        await updatePracticeTracking(score)
    } else {
        const tracking = await fetchPracticeTracking()
        if (!tracking) return <div>Error finding practice tracking</div>
        score = tracking.score
    }

  return (
    <div className="h-screen">
        <img 
            src="/fire-background.jpg" 
            alt="fire" 
            className="w-full h-full object-cover brightness-[0.08] saturate-[0.6]" 
        />
  
        {/* Your Content Container */}
        <div className="absolute inset-0 w-full h-screen flex justify-center px-10"  id="book">
            <PracticeClient 
                bookID={bookID} 
                page={practicePage.pageContent} 
                pageNumber={Number(optionalPageNumber ?? practicePage.pageNumber)} 
                score={Number(score)}
                topicId={topicId}
                wordsPerPage={wordsPerPage}
            />
        </div>
    </div>
  )
}

export default page