
export type Word = {
    _id: string,
    word: string,
    type: string,
    "language style": string,
    meaning: string,
    example: string,
    "blanked example"?: string,
    "related words"?: string[],
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

export type Conversation = {
    _id: string,
    title: string,
    description: string,
    characters: string[],
    lines: {
        actor: number, //index of character
        text: string,
        blankedText: string,
        usedWords: string[],
    }[],
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

export type ConvoSuggestion = Partial<Conversation> & {
    suggestedWords?: string[]
}

export type ExpandedSuggestion = Omit<Conversation, '_id' | 'isAiGenerated' | 'lines'> & 
        { lines: 
            {
                actor: number;
                text: string;
            }[];
        }

export type WordAttemptRecord = {
    word: string,
    meaning: string,
    userDefinition: string,
    example: string,
    userSentence: string,
}

export type WordMasteryResult = {
    word: string,
    definitionScore: number,
    sentenceScore: number,
    feedback: string,
}

export type LearningScoreResult = {
    results: WordMasteryResult[],
    overallScore: number,
    overallPassed: boolean,
    feedback: string,
}

export type Character = {
    _id: string,
    creator: string,
    name: string,
    description: string,
    bio: string,
    appearance: string,
    avatar: string,
    expertise: (Topic | string)[],
    status: 'pending' | 'ready' | 'failed',
}

export type CharacterMessage = {
    _id: string,
    character: string,
    role: 'user' | 'character',
    text: string,
    createdAt?: string,
}

export type MyLearningTopic = {
    _id: string,
    topicLevel: number,
    learnedAt: string,
    topic: Topic
}

export type StoryActor = {
    id: string
    name: string
    role: string
    description?: string
    avatar?: string
    isUser?: boolean
}

export type StoryTargetWord = {
    word: string
    meaning?: string
    example?: string
    semanticField: string[]
    biasStage: number
    hit: boolean
}

export type Story = {
    _id: string
    creator: string
    topic: string
    title: string
    setting: string
    plotSetup: string
    cast: StoryActor[]
    targetWords: StoryTargetWord[]
    currentWordIndex: number
    status: 'in_progress' | 'completed'
    createdAt?: string
}

export type StoryMessage = {
    _id: string
    story: string
    senderId: string
    senderName: string
    text: string
    kind: 'user' | 'actor' | 'narration' | 'story-starter' | 'system'
    createdAt?: string
}

export type SendStoryMessageResponse = {
    hit: boolean
    feedback?: string
    messages: StoryMessage[]
    story: Story
}
