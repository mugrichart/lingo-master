import ContentView from './ContentView'

import { Card, CardContent } from "@/components/ui/card"
import { Word } from '@/lib/definitions'

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

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

export const WordList = ({ words, topicId }: { words: Word[], topicId: string}) => {
  return (
    <div className='w-full h-220'>
      <div className='w-full flex justify-between py-4'>
        <InputGroup className='max-w-200'>
          <InputGroupInput placeholder="Search..." />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">12 results</InputGroupAddon>
        </InputGroup>
        <div>
          <Link href={`/topics/create-word?topic=${topicId}`}>
            <Button>
              <Plus />
              New word
            </Button>
          </Link>
        </div>
      </div>
      <ContentView>
        {
          words?.map(word => <WordCard key={word._id} word={word}/>)
        }
      </ContentView>
    </div>
  )
}
