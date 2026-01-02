import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Plus, Search } from "lucide-react"
import ContentView from "../topics/components/ContentView"
import Link from "next/link"
import { createPracticeTracking, fetchPracticeBooks, fetchPracticeTracking } from "@/lib/data"
import BookCard from "./BookCard"


const page = async () => {
  const books = await fetchPracticeBooks()
  let tracking = await fetchPracticeTracking()
  if (!tracking) {//create tracking
    console.warn("Couldn't find tracking... Creating it")
    tracking = await createPracticeTracking()
    if (!tracking) {
      //TODO: Fix this ASA you can
      return <div>Error creating tracking data</div>
    }
  }
  
  return (
    <div className='w-full h-220 px-5'>
       <div className='w-full flex justify-between py-4'>
        <InputGroup className='max-w-200'>
          <InputGroupInput placeholder="Search..." />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">12 results</InputGroupAddon>
        </InputGroup>
        <div className="flex gap-10 items-center">
          <Link href={`/practice-with-books/upload`}>
            <Button>
              <Plus />
              New book
            </Button>
          </Link>
          <span>{tracking?.score || 0}🪙</span>
        </div>
      </div>
      <ContentView>
        {
          books.map(book => (
            <Link key={book._id} href={`/practice-with-books/practice?bookID=${book._id}&score=${tracking.score}`}>
              <BookCard book={book} />
            </Link>
          ))
        }
      </ContentView>
    </div>
  )
}

export default page
