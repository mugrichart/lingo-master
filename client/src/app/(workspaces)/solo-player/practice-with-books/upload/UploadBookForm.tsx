import { Button } from "@/components/ui/button"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup } from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { uploadPracticeBook } from "@/lib/actions"

const UploadBookForm = () => {
  return (
    <form action={uploadPracticeBook}>
         <FieldGroup>
            <Field>
                <Label htmlFor="bookFile">Upload the book file</Label>
                <Input
                    id="bookFile"
                    type="file"
                    name="bookFile"
                    placeholder="Upload the book file"
                    accept="application/pdf"
                    required
                />
            </Field>
            <Field>
                <Label htmlFor="bookCover">Upload the book cover image</Label>
                <Input
                    id="bookCover"
                    type="file"
                    name="bookCover"
                    accept="image/*"
                    required
                />
            </Field>
            <Field>
                <Input
                    id="title"
                    type="text"
                    name="title"
                    placeholder="Enter the title of the book"
                    required
                />
            </Field>
            <Field>
                <Input
                    id="author"
                    type="text"
                    name="author"
                    placeholder="Enter the author of the book"
                    required
                />
            </Field>
            <Field>
                <Input
                    id="pageCount"
                    type="number"
                    name="pageCount"
                    placeholder="Enter the number of pages"
                    required
                />
            </Field>
            <Field orientation={"horizontal"}>
                <Input
                    id="startingPage"
                    type="number"
                    name="startingPage"
                    placeholder="Actual starting page"
                    required
                />
                <Input
                    id="endingPage"
                    type="number"
                    name="endingPage"
                    placeholder="Actual ending page"
                    required
                />
            </Field>

            <Field>
                <Button type="submit" >
                    Submit 
                </Button>
            </Field>
        </FieldGroup>
    </form>
  )
}

export default UploadBookForm
