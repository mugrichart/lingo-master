import z from "zod"

export const CreateWordSchema = z.object({
    type: z.string(),
    "language style": z.string(),
    word: z.string(),
    meaning: z.string(),
    example: z.string(),
    "blanked example": z.string(),
    synonym: z.string(),
    antonym: z.string(),
    "related words": z.array(z.string()).optional()
})

export const WordSchema = CreateWordSchema.extend({
    _id: z.string(),
    language: z.string(),
})

export const PracticeBookSchema = z.object({
    title: z.string(),
    author: z.string(),
    pageCount: z.coerce.number().positive(),
    startingPage: z.coerce.number().positive(),
    endingPage: z.coerce.number().positive(),
    bookFile: z.file(),
    bookCover: z.file()
})

export const UserSchema = z.object({
    username: z.string(),
    email: z.email(),
    avatar: z.string().optional()
})


export const CreateTopicSchema = z.object({
    name: z.string(),
    language: z.string()
})


export const SignupFormSchema = z.object({
    username: z.string(),
    email: z.email(),
    password: z.string()
})

export const LoginFormSchema = SignupFormSchema.omit({ username: true })