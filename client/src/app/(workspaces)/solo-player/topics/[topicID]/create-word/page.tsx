
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Field,
  FieldGroup,
} from "@/components/ui/field"

import { Button } from "@/components/ui/button"

import { createWord } from "@/lib/actions"

const page = async ({ 
  params
}: { params: Promise<{ topicID: string}>}) => {

  const topicIDResolved = (await params).topicID;
 
  const createWordWithTopicID = createWord.bind(null, topicIDResolved);
  
  return (
    <div className="w-full flex justify-center items-center py-20">
        <Card className="p-3 w-[500px]">
            <CardHeader className="w-full">
                <CardTitle>Create a new word</CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col gap-4 w-full bg-blue-5">
                <form action={createWordWithTopicID}>
                    <FieldGroup>
                        <Field orientation={"horizontal"}>
                            <Input
                            id="word"
                            type="text"
                            name="word"
                            placeholder="the word"
                            required
                            />
                    </Field>
                    
                    <Field>
                        <Select>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select The Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                <SelectLabel>Type</SelectLabel>
                                    <SelectItem value="verb">Verb</SelectItem>
                                    <SelectItem value="noun">Noun</SelectItem>
                                    <SelectItem value="adjective">Adjective</SelectItem>
                                    <SelectItem value="adverb">Adverb</SelectItem>
                                    <SelectItem value="idiom">Idiom</SelectItem>
                                    <SelectItem value="expression">Expression</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </Field>

                    <Field>
                        <Select>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select The Style" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                <SelectLabel>Language Style</SelectLabel>
                                    <SelectItem value="formal">Formal</SelectItem>
                                    <SelectItem value="informal">Informal</SelectItem>
                                    <SelectItem value="colloquial">Colloquial</SelectItem>
                                    <SelectItem value="slang">Slang</SelectItem>
                                    <SelectItem value="jargon">Jargon</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </Field>

                    <Field>
                        <Input
                        id="meaning"
                        type="text"
                        name="meaning"
                        placeholder="Fill with the meaning"
                        required
                        />
                    </Field>

                    <Field>
                        <Input
                        id="example"
                        type="text"
                        name="example"
                        placeholder="Fill with an example sentence"
                        required
                        />
                    </Field>

                    <Field>
                        <Input
                        id="synonym"
                        type="text"
                        name="synonym"
                        placeholder="Fill with a synonym"
                        required
                        />
                    </Field>
                    
                    <Field>
                        <Input
                        id="antonym"
                        type="text"
                        name="antonym"
                        placeholder="Fill with an antonym"
                        required
                        />
                    </Field>

                    <Field>
                        <Button type="submit">Save</Button>
                    </Field>
                </FieldGroup>
                </form>
            </CardContent>
        </Card>
    </div>
  )
}

export default page
