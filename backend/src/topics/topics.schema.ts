import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { User } from "src/users/users.schema";
import { Word } from "src/words/words.schema";

export type TopicDocument = HydratedDocument<Topic>

@Schema({ timestamps: true})
export class Topic {
    @Prop({ required: true, trim: true })
    name: string

    @Prop({ required: true })
    language: string

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Word'}], default: []})
    words: Types.ObjectId[]

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Conversation'}], default: []})
    conversations: Types.ObjectId[]

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User'})
    creator: Types.ObjectId

    @Prop({ default: null, type: mongoose.Schema.Types.ObjectId, ref: 'Topic'})
    parent: Types.ObjectId | null

    @Prop({ default: false })
    isAiGenerated: boolean

}


export const TopicSchema = SchemaFactory.createForClass(Topic)