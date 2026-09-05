import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";

export type StoryMessageDocument = HydratedDocument<StoryMessage>;

@Schema({ timestamps: true })
export class StoryMessage {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Story', required: true })
    story: Types.ObjectId;

    @Prop({ required: true })
    senderId: string; // 'me', actorId, or 'narrator'

    @Prop({ required: true })
    senderName: string;

    @Prop({ required: true })
    text: string;

    @Prop({ enum: ['user', 'actor', 'narration', 'system'], default: 'actor' })
    kind: 'user' | 'actor' | 'narration' | 'system';
}

export const StoryMessageSchema = SchemaFactory.createForClass(StoryMessage);
