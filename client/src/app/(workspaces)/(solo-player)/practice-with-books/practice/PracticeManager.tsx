import { createPracticeBookPage, createPracticePlan, fetchPracticeBookPage, fetchPracticePlan, fetchPracticeTracking } from '@/lib/data'
import React from 'react'
import PracticeClient from './PracticeClient'
import { notFound, redirect } from 'next/navigation'
import { PracticeSearchParams, Stage } from './page'
import { updatePracticeTracking } from '@/lib/actions'

async function PracticeManager(
    { searchParams } :
    { searchParams: Promise<PracticeSearchParams> }
) {
    const { bookId, page: optionalPageNumber, score: optionalScore, topicId, wordsPerPage, stage } = await searchParams

    function redirectWithStage(newStage: Stage) {
        const params = new URLSearchParams()
        if (bookId) params.set('bookId', String(bookId))
        if (optionalPageNumber !== undefined) params.set('page', String(optionalPageNumber))
        if (optionalScore !== undefined) params.set('score', String(optionalScore))
        if (topicId && topicId !== 'undefined') params.set('topicId', String(topicId))
        if (wordsPerPage !== undefined) params.set('wordsPerPage', String(wordsPerPage))
        params.set('stage', String(newStage))
        redirect(`./practice/?${params.toString()}`)
    }

    if (!stage || stage === Stage.FETCHING_PAGE) {
        const [practicePlan, practicePage] = await Promise.all([fetchPracticePlan(bookId), fetchPracticeBookPage(bookId, optionalPageNumber)])
        
        if (!practicePage) {
            if (!practicePlan) {
                return redirectWithStage(Stage.CREATING_PLAN)
            }
            return redirectWithStage(Stage.CREATING_PAGE)
        } else {
            const score = await handleScore()

            return (
                <PracticeClient 
                    bookId={bookId} 
                    page={practicePage.pageContent} 
                    pageNumber={Number(optionalPageNumber ?? practicePage.pageNumber)} 
                    score={Number(score)}
                    topicId={topicId}
                    wordsPerPage={wordsPerPage}
                />
            )
        }
    }
    else if (stage === Stage.CREATING_PLAN) {
        await createPracticePlan(bookId)
        return redirectWithStage(Stage.CREATING_PAGE)
    } 
    else if (stage === Stage.CREATING_PAGE) {
        const practicePage = await createPracticeBookPage(bookId, { pageNumber: optionalPageNumber, topicId, wordsPerPage }) //! Make sure you don't do this at the end of the book
        
        if (!practicePage) return <p>Error creating practice page</p>

        const score = await handleScore()

        return (
            <PracticeClient 
                bookId={bookId} 
                page={practicePage.pageContent} 
                pageNumber={Number(optionalPageNumber ?? practicePage.pageNumber)} 
                score={Number(score)}
                topicId={topicId}
                wordsPerPage={wordsPerPage}
            />
        )
    }

    // if (!practicePage) {
    //     console.warn("Couldn't find the practice page")
    //     if (!practicePlan) {
    //         console.warn("Couldn't find the practice plan either...Attempting to create one") //! So make sure you don't duplicate it in case of errors
    //         practicePlan = await createPracticePlan(bookId)
    //         console.log("Practice plan: ", practicePlan)
    //     } 
    //     if (!practicePlan) return <div>Error creating practice page</div>
    //     // Creating the page when we have the practice plan
    //     console.warn('Creating practice page....')
    //     practicePage = await createPracticeBookPage(bookId, { pageNumber: optionalPageNumber, topicId, wordsPerPage }) //! Make sure you don't do this at the end of the book
    //     if (!practicePage) return <div>Error finding practice page</div>
    // }
    async function handleScore() {
        let score = optionalScore
        if (score !== undefined) {
            await updatePracticeTracking(score)
            return score
        } else {
            const tracking = await fetchPracticeTracking()
            if (!tracking) throw notFound()
            score = tracking.score
            return score
        }
    }

    // Fetching Practice plan & page
        // practice page not found
            // Practice plan not found, creating one
        // Creating page

        // tracking not found,
    
    //if page -> practice client
    //else -> redirect here with page-not-found
        // creating plan
        // creating pagek
    
}

export default PracticeManager
