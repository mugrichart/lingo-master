import { Suspense } from "react"
import PracticeManager from "./PracticeManager"

export enum Stage {
    FETCHING_PAGE = "fetching page",
    CREATING_PLAN = "creating plan",
    CREATING_PAGE = "creating page"
}
export type PracticeSearchParams = {
    bookId: string, page?: number, score?: number, topicId?: string, wordsPerPage?: number, stage?: Stage 
    stages?: string
}

const page = async ({
    searchParams
}:{
    searchParams: Promise<PracticeSearchParams>
}) => {
    
    const FallBack = async () => {
        const { stage, stages } = await searchParams
        const order = [Stage.FETCHING_PAGE, Stage.CREATING_PLAN, Stage.CREATING_PAGE]
        const parsedStages = (stages ?? '').split(',').map(s => Number(s)).filter(n => Number.isFinite(n) && n >= 0 && n < order.length)
        const currentIndex = Math.max(0, order.indexOf(stage as Stage))

        // Visible set = all touched stages + the current one
        const visibleSet = new Set<number>(parsedStages)
        visibleSet.add(currentIndex)
        const visible = [...visibleSet].sort((a, b) => a - b)
         const labels: Record<Stage, string> = {
             [Stage.FETCHING_PAGE]: "Fetching page",
             [Stage.CREATING_PLAN]: "Creating plan",
             [Stage.CREATING_PAGE]: "Creating page"
         }
     
         return (
             <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-lg">
                     <h3 className="text-lg font-semibold text-white mb-1">Preparing your practice</h3>
                     <p className="text-sm text-white/70 mb-4">Hang tight — we're getting everything ready for you.</p>
 
                    <ul className="space-y-3">
                        {visible.map(idx => {
                            const s = order[idx] as Stage
                            const done = parsedStages.includes(idx) && idx !== currentIndex
                            const active = idx === currentIndex
                            return (
                                <li key={s} className="flex items-center gap-4">
                                    <div className={`w-9 h-9 flex items-center justify-center rounded-full ${done ? 'bg-green-500' : active ? 'bg-blue-500' : 'bg-white/10'}`}>
                                        {done ? (
                                            <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="none" aria-hidden>
                                                <path d="M4.5 10.5l3 3L15.5 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        ) : active ? (
                                            <svg className="w-5 h-5 text-white animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
                                                <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4 text-white/70" viewBox="0 0 20 20" fill="none" aria-hidden>
                                                <circle cx="10" cy="10" r="3" fill="currentColor" />
                                            </svg>
                                        )}
                                    </div>
    
                                    <div>
                                        <div className={`text-sm font-medium ${done ? 'text-white' : active ? 'text-white' : 'text-white/70'}`}>{labels[s]}</div>
                                        {active && <div className="text-xs text-white/60">Working on it…</div>}
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
 
                     <div className="mt-5 text-xs text-white/60">This may take a few seconds. If it’s stuck, try refreshing.</div>
                 </div>
             </div>
         )
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
            <Suspense fallback={<FallBack />}>
                <PracticeManager searchParams={searchParams}/>
            </Suspense>
        </div>
    </div>
  )
}

export default page