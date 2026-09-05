import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";

export type StoryDocument = HydratedDocument<Story>;

@Schema({ id: false })
export class StoryActor {
    @Prop({ required: true })
    id: string;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    role: string;

    @Prop({ default: '' })
    description: string;

    @Prop({ default: '' })
    avatar: string;

    @Prop({ default: false })
    isUser: boolean;
}

@Schema({ id: false })
export class StoryTargetWord {
    @Prop({ required: true })
    word: string;

    @Prop({ default: '' })
    meaning: string;

    @Prop({ default: '' })
    example: string;

    @Prop({ type: [String], default: [] })
    semanticField: string[];

    @Prop({ default: 0 })
    biasStage: number;

    @Prop({ default: false })
    hit: boolean;
}

@Schema({ timestamps: true })
export class Story {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    creator: Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true })
    topic: Types.ObjectId;

    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    setting: string;

    @Prop({ required: true })
    plotSetup: string;

    @Prop({ type: [StoryActor], default: [] })
    cast: StoryActor[];

    @Prop({ type: [StoryTargetWord], default: [] })
    targetWords: StoryTargetWord[];

    @Prop({ default: 0 })
    currentWordIndex: number;

    @Prop({ enum: ['in_progress', 'completed'], default: 'in_progress' })
    status: 'in_progress' | 'completed';
}

export const StorySchema = SchemaFactory.createForClass(Story);
