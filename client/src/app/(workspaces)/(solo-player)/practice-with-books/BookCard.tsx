import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PracticeBook } from "@/lib/definitions"
import { Book, Edit, Trash } from "lucide-react"
import Image from "next/image"
import { EllipsisVertical } from "lucide-react"

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

const BookCard = ({ book }: { book: PracticeBook}) => (
    <ContextMenu>
        <ContextMenuTrigger className="flex items-center justify-center">
            <Card className="aspect-square justify-between w-100">
                <CardHeader>
                        <CardTitle>
                            {book.title}
                        </CardTitle>
                        
                    <CardDescription>By {book.author}</CardDescription>
                </CardHeader>
                <CardContent className="justify-center">
                    <img src={book.coverUrl} alt="book cover" width="100%" height="20"/>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <label>{book.pageCount} pages</label>
                    <Button><Book />Practice</Button>
                </CardFooter>
            </Card>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-52">
            <ContextMenuItem inset>
                Edit
            </ContextMenuItem>
            <ContextMenuItem inset>
                Delete
            </ContextMenuItem>
            <ContextMenuItem inset>
                Rename
            </ContextMenuItem>
            <ContextMenuItem inset>
                Share
            </ContextMenuItem>
        </ContextMenuContent>
    </ContextMenu>
)

export default BookCard