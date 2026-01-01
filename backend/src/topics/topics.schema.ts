import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { User } from "src/users/users.schema";
import { Word } from "src/words/words.schema";

export type TopicDocument = HydratedDocument<Topic>
export type TopicLearningDocument = HydratedDocument<Learning>

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

@Schema({ id: false })
class LearningWord {
    @Prop({ type: mongoose.SchemaTypes.ObjectId, ref: 'Word'})
    word: Types.ObjectId
    @Prop({ default: 0})
    level: number
}

@Schema({ timestamps: true})
export class Learning {
    @Prop({ type: mongoose.SchemaTypes.ObjectId, ref: 'User'})
    user: Types.ObjectId

    @Prop({ type: mongoose.SchemaTypes.ObjectId, ref: 'Topic'})
    topic: Types.ObjectId

    @Prop({ type: [LearningWord]})
    words: { word: Types.ObjectId, level: number}[]

    @Prop({ default: 0}) chunkIndex: number
    @Prop({ default: 0}) chunkLevel: number
    @Prop({ default: 0}) topicLevel: number

}


export const TopicSchema = SchemaFactory.createForClass(Topic)
export const TopicLearningSchema = SchemaFactory.createForClass(Learning)
TopicLearningSchema.index({ user: 1, topic: 1 }, { unique: true });