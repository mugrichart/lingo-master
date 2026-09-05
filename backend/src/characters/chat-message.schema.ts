import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";

export type ChatMessageDocument = HydratedDocument<ChatMessage>

@Schema({ timestamps: true })
export class ChatMessage {
    /** the direct-chat thread: the character this conversation is with */
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Character', required: true, index: true })
    character: Types.ObjectId

    /** 'user' for the human, 'character' for the LLM actor */
    @Prop({ enum: ['user', 'character'], required: true })
    role: 'user' | 'character'

    @Prop({ required: true })
    text: string
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage)
