
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