
export type Word = {
    _id: string,
    word: string,
    type: string,
    "language style": string,
    meaning: string,
    example: string,
    "blanked example": string,
    "related words": string[],
    synonym: string,
    antonym: string,
}

export type Topic = {
    _id: string,
    name: string,
    language: string,
    creator: string,
    words: string[],
    isAiGenerated: boolean,
    parent: string | null,
}

export type Convo = {
    _id: string,
    title: string,
    description: string,
    characters: string[],
    lines: [
        {
            actor: number, //index of character
            text: string,
            blankedText: string,
            usedWords: string[],
        }
    ],
    topic: string,
    creator: string,
    isAiGenerated: boolean,
}

export type PracticeBook = {
    _id: string,
    title: string,
    author: string,
    pageCount: number,
    startingPage: number,
    endingPage: number,
    pdfUrl: string,
    coverUrl: string
}

export type PracticeBookPage = {
    text: string,
    words: string[],
    options: string[]
}

export type TopicSuggestion = string

type OptionalExcept<T, Exceptions extends keyof T> = Pick<T, Exceptions> & Partial<Omit<T, Exceptions>>

export type WordSuggestion = OptionalExcept<Word, "word" | "example">

export type ConvoSuggestion = OptionalExcept<Convo, "title" | "description"> & {
    suggestedWords?: string[]
}