import z from "zod"

export const TopicSchema = z.object({
    _id: z.string(),
    name: z.string(),
    language: z.string(),
    creator: z.string(),
    words: z.array(z.string()),
    parent: z.string().nullable(),
    isAiGenerated: z.boolean()
})

export const WordSchema = z.object({
    _id: z.string(),
    language: z.string(),
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

export const ConversationSchema = z.object({
    _id: z.string(),
    title: z.string(),
    description: z.string(),
    characters: z.array(z.string()),
    lines: z.array(z.object({
        actor: z.number(),
        text: z.string(),
        blankedText: z.string(),
        usedWords: z.array(z.string())
    })),
    isAiGenerated: z.boolean()
})

export const PracticeBookSchema = z.object({
    title: z.string(),
    author: z.string(),
    pageCount: z.coerce.number().positive(),
    startingPage: z.coerce.number().positive(),
    endingPage: z.coerce.number().positive(),
})

export const PracticeBookPageSchema = z.object({ 
    pageContent: z.object({ 
        text: z.string(),       
        words: z.array(z.string()),
        options: z.array(z.string())
    }),
    pageNumber: z.number()
})

export const UserSchema = z.object({
    username: z.string(),
    email: z.email(),
    avatar: z.string().optional()
})



export const AuthFormSchema = z.object({
    username: z.string(),
    email: z.email(),
    password: z.string()
})

export const LearningScoreSchema = z.object({
    results: z.array(z.object({
        word: z.string(),
        definitionScore: z.number(),
        sentenceScore: z.number(),
        feedback: z.string()
    })),
    overallScore: z.number(),
    overallPassed: z.boolean(),
    feedback: z.string()
})

export const CharacterSchema = z.object({
    _id: z.string(),
    creator: z.string(),
    name: z.string(),
    description: z.string(),
    bio: z.string(),
    appearance: z.string(),
    avatar: z.string(),
    expertise: z.array(z.any()).default([]),
    status: z.enum(['pending', 'ready', 'failed'])
})

export const CharacterMessageSchema = z.object({
    _id: z.string(),
    character: z.string(),
    role: z.enum(['user', 'character']),
    text: z.string(),
    createdAt: z.string().optional()
})