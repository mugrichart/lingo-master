'use client'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

import { Badge } from '@/components/ui/badge'
import { PracticeBookPage } from '@/lib/definitions'
import { handleBlanksGen } from '@/lib/utils'
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { usePractice } from "./usePractice"

const PracticeClient = (
    { page, bookId, pageNumber, score: initialScore, topicId, wordsPerPage }: 
    { page: PracticeBookPage, bookId: string, pageNumber: number, score: number, topicId?: string, wordsPerPage?: number}
) => {

    const { allPs, currentStreak, score, currentPidx, solvedWords, handleWordChoice } = usePractice(initialScore, page)

  return (
    <div className="w-full">
        <div className="flex justify-end h-[5%] items-center w-full">
            <span className="flex gap-2 relative" id="streak">
                { currentStreak >= 3 ? "💎" : 
                    currentStreak === 2 ? "🔥" :
                    currentStreak ? "⭐" : "💣"

                }
            </span>
            <span className="ml-10">{score}🪙</span>
        </div>
        <div className="p-3 flex h-[95%] w-full gap-5">
            <Card className="w-100 h-fit bg-card/50 backdrop-blur-md">
                <CardHeader>
                    <CardTitle>Key words:</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {page.options.map((w, i) => (
                            <Badge 
                                key={`${w}-${i}`} 
                                onClick={() => handleWordChoice(w)} 
                                variant="secondary" 
                                className="cursor-pointer"
                            >
                                {w}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>
            
            <Card className="w-200 bg-card/50 backdrop-blur-2xl pl-10">
                <ScrollArea className="h-full overflow-hidden">
                    <CardContent>
                        {allPs.map((pg, idx) => {
                            let displayedText = pg
                            if (idx === currentPidx) {
                                // Show current paragraph with solved words visible
                                const lookupWords = page.words.filter(w => !solvedWords.includes(w))
                                displayedText = handleBlanksGen(pg, lookupWords).blanked
                            } else if (idx > currentPidx) {
                                // Leave future ps untouched. To focus on the current
                                // displayedText
                            }
                            
                            return <p key={idx} className={
                                    displayedText[0] === displayedText[0]?.toUpperCase() ? 'mt-5' : 'mt-1'
                                }>{displayedText}</p>
                        })}
                    </CardContent>
                    <ScrollBar orientation='vertical' />
                </ScrollArea>
                <CardFooter className="flex justify-center">
                    <div className="flex gap-5 items-center">
                        <Link className="bg-secondary p-1 pl-3 rounded-l-md" href={`practice?bookId=${bookId}&page=${pageNumber - 1}&score=${score}`}>Prev Page</Link>
                        <label htmlFor="">{pageNumber}</label>
                        { currentPidx >= allPs.length &&
                            <Link className="bg-secondary p-1 pr-3 rounded-r-md" href={`practice?bookId=${bookId}&page=${pageNumber + 1}&score=${score}&topicId=${topicId}&wordsPerPage=${wordsPerPage || 2}`}>Next Page</Link>
                        }
                    </div>
                </CardFooter>
            </Card>
        </div>
    </div>
  )
}

export default PracticeClient
