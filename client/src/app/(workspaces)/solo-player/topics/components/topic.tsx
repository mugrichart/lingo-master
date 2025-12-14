'use client'

import { usePathname } from "next/navigation"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash, Edit, Share } from "lucide-react"

import ContentView from './ContentView'

import { Topic } from "@/lib/definitions"
import Link from "next/link"

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


export const TopicList = ({ topics }: { topics: Topic[]}) => {
  const pathname = usePathname()

  return (
    <ContentView>
      {
        topics.map(topic => (
          <Link key={topic._id} href={`${pathname}/${topic._id}`}>
            <TopicCard topic={topic} />
          </Link>
        ))
      }
    </ContentView>
  )
}
