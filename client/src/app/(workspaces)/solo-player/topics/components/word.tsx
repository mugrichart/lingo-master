import ContentView from './ContentView'

import { Card, CardContent } from "@/components/ui/card"
import { Word } from '@/lib/definitions'

export const WordCard = ({ word }: { word: Word}) => {
  return (
    <Card className="p-3 aspect-square justify-between w-90">
        <div className="w-full flex justify-between">
            <label>{word.word}</label>
            <div className="flex flex-col">
                <label>{word.type}</label>
                <label>-{word['language style']}</label>
            </div>
        </div>
        <CardContent className="flex flex-col items-center gap-4">
            <p>
                def: {word.meaning}
            </p>
            <p>
                eg. {word.example}
            </p>
        </CardContent>
        <div className="">
            <p>Synonym: {word.synonym}</p>
            <p>Antonym: {word.antonym}</p>
        </div>
    </Card>
  )
}

export const WordList = ({ words }: { words: Word[]}) => {
  return (
    <ContentView>
      {
        words.map(word => <WordCard key={word._id} word={word}/>)
      }
    </ContentView>
  )
}
