import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type ConversationDocument = HydratedDocument<Conversation>

@Schema()
export class Conversation {
    @Prop()
    title: string

    @Prop()
    description: string

    
    @Prop()
    characters: string[]

    
    @Prop()
    lines: { actor: number, text: string, blankedText: string, usedWords: string[]}[]

    
    @Prop({ default: true })
    isAiGenerated: boolean
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation)

