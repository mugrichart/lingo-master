
export type Word = {
    _id: string,
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