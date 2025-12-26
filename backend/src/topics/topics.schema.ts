import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
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
    words: Word[]

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User'})
    creator: string

    @Prop({ default: null, type: mongoose.Schema.Types.ObjectId, ref: 'Topic'})
    parent: string | null

    @Prop({ default: false })
    isAiGenerated: boolean

}


export const TopicSchema = SchemaFactory.createForClass(Topic)