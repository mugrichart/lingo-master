
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
    words: Word[],
    isAiGenerated: boolean,
    parent: string | null,
}