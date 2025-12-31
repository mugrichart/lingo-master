import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { type Service } from "src/file-storage/storage.types";

export type BookDocument = HydratedDocument<Book>
export type BookPracticeDocument = HydratedDocument<BookPractice>
export type BookPracticePageDocument = HydratedDocument<BookPracticePage>
export type BookPracticePageContentDocument = HydratedDocument<BookPracticePageContent>
export type BookPracticeTrackingDocument = HydratedDocument<BookPracticeTracking>

@Schema()
export class Book {
    @Prop() title: string
    @Prop() author: string
    @Prop() pageCount: number
    @Prop() startingPage: number
    @Prop() endingPage: number
    @Prop() pdfUrl: string
    @Prop() coverUrl: string
    @Prop({ default: 'AWS'}) storageService: Service
}

@Schema()
export class BookPractice {
    @Prop({ type: mongoose.SchemaTypes.ObjectId, ref: 'Book'}) 
    bookId: Types.ObjectId

    @Prop({ type: mongoose.SchemaTypes.ObjectId, ref: 'User'})
    user: Types.ObjectId
    
    @Prop({ default: 0}) cursorAt: number
    
    @Prop({ type: [{type: mongoose.SchemaTypes.ObjectId, ref: 'BookPracticePage'}], default: [] })
    pages: Types.ObjectId[]
}

const contentStatusValues = ['not-processed', 'processing', 'ready'] as const

@Schema()
export class BookPracticePage {
    @Prop({ type: mongoose.SchemaTypes.ObjectId, ref: 'BookPracticePageContent'}) 
    content: Types.ObjectId

    @Prop({ default: 'not-processed', enum: contentStatusValues})
    contentStatus: typeof contentStatusValues[number]

    @Prop() topic: string // the topic of the keywords
    @Prop() words: string[] // the keywords that have been used from the set
    @Prop() options: string[] // the option words from which the keywords were picked from
}

@Schema()
export class BookPracticePageContent {
    @Prop()
    text: string
}



@Schema()
export class BookPracticeTracking {
    @Prop({ type: mongoose.SchemaTypes.ObjectId, ref: 'User', unique: true}) user: Types.ObjectId
    @Prop({ default: 0}) score: number
}

export const BookSchema = SchemaFactory.createForClass(Book)
export const BookPracticeSchema = SchemaFactory.createForClass(BookPractice)
export const BookPracticePageSchema = SchemaFactory.createForClass(BookPracticePage)
export const BookPracticePageContentSchema = SchemaFactory.createForClass(BookPracticePageContent)
export const BookPracticeTrackingSchema = SchemaFactory.createForClass(BookPracticeTracking)