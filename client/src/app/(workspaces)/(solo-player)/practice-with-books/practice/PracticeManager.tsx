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
                redirectWithStage(Stage.CREATING_PLAN)
                return <div>Oops!!</div>
            }
            redirectWithStage(Stage.CREATING_PAGE)
            return <div>Oops!!</div>
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
        redirectWithStage(Stage.CREATING_PAGE)
        return <div>Oops!!</div>
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

    else return <div>Something went wrong</div>
}

export default PracticeManager
