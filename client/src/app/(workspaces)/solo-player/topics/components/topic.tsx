'use client'

import { usePathname } from "next/navigation"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash, Edit, Share } from "lucide-react"

import ContentView from './ContentView'

import { Topic } from "@/lib/definitions"
import Link from "next/link"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Plus, Search } from 'lucide-react'

export const TopicCard = ({ topic }: { topic: Topic }) => {
  return (
    <Card className="p-3 aspect-square justify-between w-70">
        <div className="w-full flex justify-between">
            <label>{ topic.language }</label>
            <div>
                <Button variant="ghost" size="icon" aria-label="Delete">
                    <Trash />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Edit">
                    <Edit />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Share">
                    <Share />
                </Button>
            </div>
            <label className="mr-2">Yours</label>
        </div>
        <CardContent className="flex justify-center">
            { topic.name }
        </CardContent>
        <div className="w-full flex justify-between">
            <label>Mastery: 100%</label>
            <label>{ topic.words.length }</label>
        </div>
    </Card>
  )
}

export const TopicList = ({ topics, topicID }: { topics: Topic[], topicID?: string}) => {
  const pathname = usePathname()

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
          <Link href={topicID ? `/solo-player/topics/create-topic?parentTopic=${topicID}` : `/solo-player/topics/create-topic`}>
            <Button>
              <Plus />
              New {topicID ? "subtopic" : "topic"}
            </Button>
          </Link>
        </div>
      </div>
      <ContentView>
        {
          topics.map(topic => (
            <Link key={topic._id} href={`${pathname}/${topic._id}`}>
              <TopicCard topic={topic} />
            </Link>
          ))
        }
      </ContentView>
    </div>
  )
}
