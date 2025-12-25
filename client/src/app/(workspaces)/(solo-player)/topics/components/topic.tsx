'use client'

import { usePathname } from "next/navigation"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash, Edit, Share, Book, FolderOpen, Move3d, MoveHorizontal } from "lucide-react"

import ContentView from './ContentView'

import { Topic } from "@/lib/definitions"
import Link from "next/link"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Plus, Search } from 'lucide-react'


import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"


export const TopicCard = ({ topic }: { topic: Topic }) => {
  return (
    <Card className="p-3 aspect-square justify-between w-70">
        <div className="w-full flex justify-between">
            <label>{ topic.language }</label>
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
          <Link href={topicID ? `/topics/create-topic?parentTopic=${topicID}` : `/topics/create-topic`}>
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
            <ContextMenu key={topic._id}>
              <ContextMenuTrigger>
                  <Link href={`${pathname}/${topic._id}`}>
                    <TopicCard topic={topic} />
                  </Link>
              </ContextMenuTrigger>
              <ContextMenuContent className="">
                  <ContextMenuItem>
                      <Link href={`${pathname}/${topic._id}`} className="flex items-center gap-2">
                        <FolderOpen /> Open Topic
                      </Link>
                  </ContextMenuItem>
                  <ContextMenuItem>
                      <Link href={`/topics/edit-topic?topicID=${topic._id}`} className="flex items-center gap-2">
                        <Edit /> Edit Topic
                      </Link>
                  </ContextMenuItem>
                  <ContextMenuItem>
                      <Share /> Share Topic
                  </ContextMenuItem>
                  <ContextMenuItem>
                      <MoveHorizontal /> Move Topic
                  </ContextMenuItem>
                  <ContextMenuItem>
                      <Plus /> New word
                  </ContextMenuItem>
                  <ContextMenuItem>
                      <Book /> Learn Topic
                  </ContextMenuItem>
                  <ContextMenuItem variant="destructive">
                      <Trash />Delete Topic
                  </ContextMenuItem>
              </ContextMenuContent>
          </ContextMenu>
          ))
        }
      </ContentView>
    </div>
  )
}

