'use client'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

import { Badge } from '@/components/ui/badge'
import { PracticeBookPage } from '@/lib/definitions'
import { handleBlanksGen } from '@/lib/utils'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

const PracticeClient = ({ page, bookID, pageNumber }: { page: PracticeBookPage, bookID: string, pageNumber: number}) => {
    const [currentPidx, setCurrentPidx] = useState(0)
    const [solvedWords, setSolvedWords] = useState<string[]>([])
    const [score, setScore] = useState(0)

    const allPs = useMemo(() => page.text.split("\n"), [page.text])

    const [currentStreak, setCurrentStreak] = useState(0)

    // Helper to find the next paragraph that actually has blanks
    const findNextParagraphWithBlanks = useCallback((startIndex: number) => {
        for (let i = startIndex; i < allPs.length; i++) {
            const { blanked } = handleBlanksGen(allPs[i], page.words, false) // Get initial blanked version
            if (blanked !== allPs[i]) {
                return { index: i, text: blanked }
            }
        }
        return { index: allPs.length, text: "" } // No more blanks found
    }, [allPs])

    // Initialize the first paragraph index that has blanks
    useEffect(() => {
        const first = findNextParagraphWithBlanks(0)
        setCurrentPidx(first.index)
    }, [findNextParagraphWithBlanks])


    const handleWordChoice = (word: string) => {
        if (currentPidx >= allPs.length) return

        const fullP = allPs[currentPidx]
        const nextSolvedWords = [...solvedWords, word]
        
        // We pass ALL target words, but filter which ones are "solved" (visible)
        const lookupWords = page.words.filter(w => !nextSolvedWords.includes(w))
        const { blanked, usedExpressions } = handleBlanksGen(fullP, lookupWords, false)
        if (blanked === fullP) {
            // This paragraph is finished. Find the NEXT one that has blanks.
            const next = findNextParagraphWithBlanks(currentPidx + 1)
            setCurrentPidx(next.index)
            animate(currentStreak + 1)
            setSolvedWords([]) // Reset for the new paragraph
        } else {
            // Paragraph not finished. Check if the clicked word actually filled a blank.
            const { blanked: prevBlanked, usedExpressions } = handleBlanksGen(fullP, page.words.filter(w => !solvedWords.includes(w)), false)
            if (blanked !== prevBlanked) {
                animate(currentStreak + 1)
                setSolvedWords(nextSolvedWords)
            } else animate(0)
        }
    }

    function animate(level: number) {
        if (currentPidx >= allPs.length) return;
        setScore(score + level)
        const target = document.getElementById('streak');
        if (!target) return;

        // 1. Create the "FX" Star
        const fxStar = document.createElement('div');
        fxStar.textContent = {0: "💣", 1: "⭐", 2: "🔥", 3: "💎"}[level] ?? "💎"
        fxStar.style.position = "fixed";
        fxStar.style.zIndex = "999";
        fxStar.style.left = "50%";
        fxStar.style.top = "50%";
        fxStar.style.fontSize = "24px";
        fxStar.style.pointerEvents = "none";
        
        // 2. Start the "Pop & Vibrate"
        fxStar.style.animation = "game-pop 0.6s forwards";
        document.body.appendChild(fxStar);

        // 3. After the vibration (600ms), fly to target
        setTimeout(() => {
            const rect = target.getBoundingClientRect();
            
            fxStar.style.transition = "all 0.6s cubic-bezier(0.6, -0.28, 0.735, 0.045)"; // "Slingshot" feel
            fxStar.style.left = `${rect.left + rect.width / 2}px`;
            fxStar.style.top = `${rect.top + rect.height / 2}px`;
            fxStar.style.transform = "scale(1)";
            fxStar.style.opacity = "0.5";

            // 4. Cleanup and "Mini-pop" on the real UI
            setTimeout(() => {
                fxStar.remove();
                setCurrentStreak(level)
                target.style.transform = "scale(1.5)";
                setTimeout(() => target.style.transform = "scale(1)", 200);
            }, 600);
        }, 800); 
    }


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
            
            <Card className="w-200 bg-card/50 backdrop-blur-2xl">
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
                            
                            return <p key={idx} className="mt-5">{displayedText}</p>
                        })}
                    </CardContent>
                    <ScrollBar orientation='vertical' />
                </ScrollArea>
                <CardFooter className="flex justify-center">
                    <div className="flex gap-5 items-center">
                        <Link className="bg-secondary p-1 pl-3 rounded-l-md" href={`practice?bookID=${bookID}&page=${pageNumber - 1}`}>Prev Page</Link>
                        <label htmlFor="">{pageNumber}</label>
                        <Link className="bg-secondary p-1 pr-3 rounded-r-md" href={`practice?bookID=${bookID}&page=${pageNumber + 1}`}>Next Page</Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    </div>
  )
}

export default PracticeClient
