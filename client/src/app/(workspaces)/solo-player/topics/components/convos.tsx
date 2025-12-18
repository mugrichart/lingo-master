'use client'

import { usePathname } from "next/navigation"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash, Edit, Share, BookIcon } from "lucide-react"

import ContentView from './ContentView'

import { Topic, Word } from "@/lib/definitions"
import Link from "next/link"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Plus, Search } from 'lucide-react'

import { Badge } from "@/components/ui/badge"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import { Convo } from "@/lib/definitions"

export const ConvoCard = ({ words, convo, topicID }: { words: Word[], convo: Convo, topicID?: string  }) => {
  return (
    <Card className="p-3 aspect-square justify-between items-end w-130 h-fit">
        <CardContent className="w-full h-[90%] justify-between flex flex-col">
            <div className="w-full h-50"></div>
            <Accordion
                type="single"
                collapsible
                className="w-full"
                // defaultValue="item-1"
                >
                <AccordionItem value="item-1">
                    <AccordionTrigger>{convo.title}</AccordionTrigger>
                    <AccordionContent className="flex flex-col gap-4 text-balance">
                    <p>{convo.description}</p>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger>Key Words</AccordionTrigger>
                    <AccordionContent className="flex gap-4 text-balance">
                        {
                            convo.lines.map(line => (
                                <Badge variant="default">{line.usedWords}</Badge>
                            ))
                        }
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

        </CardContent>
        <CardFooter className="h-[10%]">
          <Link href={`/solo-player/topics/practice-convo?topic=${topicID}&convo=${convo._id}`}>
            <Button><BookIcon />Practice</Button>
          </Link>
        </CardFooter>       
    </Card>
  )
}

export const ConvosList = ({ words, topicID, convos }: { words: Word[], topicID?: string, convos: any[]}) => {

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
            <div className="flex gap-2">
               <Link href={ `/solo-player/topics/create-convo?topic=${topicID}` }>
                    <Button>
                        <Plus />
                        New convo
                    </Button>
                </Link>
            </div>
        </div>
      <ContentView>
        {
          convos.map(convo => (
            // <Link key={topic._id} href={`${pathname}/${topic._id}`}>
              <ConvoCard convo={convo} words={words} topicID={topicID}/>
            // </Link>
          ))
        }
      </ContentView>
    </div>
  )
}
