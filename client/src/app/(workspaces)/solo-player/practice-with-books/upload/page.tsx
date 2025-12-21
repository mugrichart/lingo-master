import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import UploadBookForm from "./UploadBookForm"

const page = () => {
  return (
    <div className="w-full flex justify-center gap-10 py-20">
         <Card className="w-125 h-fit">
        <CardHeader className="w-full">
            <CardTitle>Upload a new book</CardTitle>
            <CardDescription>This book will be used to practice new words</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 w-full">
            <UploadBookForm />
        </CardContent>

    </Card>
    </div>
  )
}

export default page
