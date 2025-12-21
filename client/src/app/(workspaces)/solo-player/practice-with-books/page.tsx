import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Plus, Search } from "lucide-react"
import ContentView from "../topics/components/ContentView"
import Link from "next/link"
import { fetchPracticeBooks } from "@/lib/data"


const page = async () => {
  const { books } = await fetchPracticeBooks()
  console.log(books)
  
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
          <Link href={`/solo-player/practice-with-books/upload`}>
            <Button>
              <Plus />
              New book
            </Button>
          </Link>
        </div>
      </div>
      <ContentView>
        {/* {
          topics.map(topic => (
            <Link key={topic._id} href={`${pathname}/${topic._id}`}>
              <TopicCard topic={topic} />
            </Link>
          ))
        } */}
        <></>
      </ContentView>
    </div>
  )
}

export default page
