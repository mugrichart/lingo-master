import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardTitle } from "@/components/ui/card"
import { fetchPracticeBookPage } from "@/lib/session-data"
import Link from "next/link"

const page = async ({
    searchParams
}:{
    searchParams: Promise<{bookID: string, page?: number}>
}) => {
    const { bookID, page: pageNumber } = await searchParams
    const { page, cursorAt } = await fetchPracticeBookPage(bookID, pageNumber)
    console.log(page)

  return (
    <div className="w-full flex justify-center py-20">
        <Card className="w-200 p-5">
            <CardTitle>{bookID}</CardTitle>
            <CardDescription>Practice with this book</CardDescription>
            <CardContent>
                <div>
                    { page?.text?.split("\n").map(pg => <p className="mt-5">{pg}</p>) }
                    <div className="mt-5">
                        <label htmlFor="">Key words:</label>
                        <ul>
                            {
                                page?.words?.map((w: string) => <Badge variant="secondary">{w}</Badge>)
                            }
                        </ul>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Link href={`practice?bookID=${bookID}&page=${(Number(pageNumber ?? cursorAt)) + 1}`}>Next Page</Link>
            </CardFooter>
        </Card>
    </div>
  )
}

export default page
