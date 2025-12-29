import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, MongooseError, Types } from "mongoose";

export type WordDocument = HydratedDocument<Word>

export const typeValues = ['noun', 'verb', 'adverb', 'adjective', 'idiom', 'expression'] as const;
export type types = typeof typeValues[number]

export const languageStyleValues = ['formal', 'informal', 'jargon', 'colloquial', 'slang'] as const
export type languageStyle = typeof languageStyleValues[number] 

@Schema()
export class Word {
    @Prop({ default: "english"})
    language: string

    @Prop({ type: String, required: true, enum: typeValues})
    type: types

    @Prop()
    word: string

    @Prop({ type: String, required: true, enum: languageStyleValues})
    "language style": languageStyle

    @Prop()
    meaning: string

    @Prop()
    example: string

    @Prop()
    "blanked example": string

    @Prop()
    synonym: string

    @Prop()
    antonym: string

    @Prop()
    "related words": Types.ObjectId[]

}


export const WordSchema = SchemaFactory.createForClass(Word)

WordSchema.index({ type: 1, word: 1, "language style": 1}, { unique: true})
