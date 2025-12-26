import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type WordDocument = HydratedDocument<Word>

export const typeValues = ['noun', 'verb', 'adverb', 'adjective', 'idiom', 'expression'] as const;
export type types = typeof typeValues[number]

export const languageStyleValues = ['formal', 'informal', 'jargon', 'colloquial', 'slang'] as const
export type languageStyle = typeof languageStyleValues[number] 

@Schema()
export class Word {
    @Prop({ type: String, required: true, enum: typeValues})
    type: types

    @Prop({ type: String, required: true, enum: languageStyleValues})
    languageStyle: languageStyle
}


export const WordSchema = SchemaFactory.createForClass(Word)