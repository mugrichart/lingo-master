import { 
    createPracticeBookPage, 
    createPracticePlan, 
    fetchPracticeBookPage, 
    fetchPracticePlan, 
    fetchPracticeTracking 
} from "@/lib/data"

import PracticeClient from "./PracticeClient"
import { updatePracticeTracking } from "@/lib/actions"

const page = async ({
    searchParams
}:{
    searchParams: Promise<{bookId: string, page?: number, score?: number, topicId?: string, wordsPerPage?: number}>
}) => {
    const { bookId, page: optionalPageNumber, score: optionalScore, topicId, wordsPerPage } = await searchParams
    let [practicePlan, practicePage] = await Promise.all([fetchPracticePlan(bookId), fetchPracticeBookPage(bookId, optionalPageNumber)])
    if (!practicePage) {
        console.warn("Couldn't find the practice page")
        if (!practicePlan) {
            console.warn("Couldn't find the practice plan either...Attempting to create one") //! So make sure you don't duplicate it in case of errors
            practicePlan = await createPracticePlan(bookId)
            console.log("Practice plan: ", practicePlan)
        } 
        if (!practicePlan) return <div>Error creating practice page</div>
        // Creating the page when we have the practice plan
        console.warn('Creating practice page....')
        practicePage = await createPracticeBookPage(bookId, { pageNumber: optionalPageNumber, topicId, wordsPerPage }) //! Make sure you don't do this at the end of the book
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
                bookId={bookId} 
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