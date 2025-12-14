import ContentView from './ContentView'

import { Card, CardContent } from "@/components/ui/card"

export const WordCard = () => {
  return (
    <Card className="p-3 aspect-square justify-between w-90">
        <div className="w-full flex justify-between">
            <label>Word</label>
            <div className="flex flex-col">
                <label>Noun</label>
                <label>-Jargon</label>
            </div>
        </div>
        <CardContent className="flex flex-col items-center gap-4">
            <p>
                def: The definition of the greatest word to ever exist in this realm and the next. So please don't play with me
            </p>
            <p>
                eg. There are things you joke about and things you don't joke about, and the hardest thing is to know which type you are dealing with
            </p>
        </CardContent>
        <div className="">
            <p>Synonym: The synonym</p>
            <p>Antonym: The antonym</p>
        </div>
    </Card>
  )
}

export const WordList = () => {
  return (
    <ContentView>
      {
        [0, 1, 2,0, 1, 2,0, 1, 2,0, 1, 2,0, 1, 2,0, 1, 2,].map((_, i) => <WordCard key={i}/>)
      }
    </ContentView>
  )
}
