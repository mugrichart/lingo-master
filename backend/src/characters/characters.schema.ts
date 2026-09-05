import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";

export type CharacterDocument = HydratedDocument<Character>

@Schema({ timestamps: true })
export class Character {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    creator: Types.ObjectId

    @Prop({ trim: true, default: '' })
    name: string

    /** short one-liner persona shown under the name */
    @Prop({ default: '' })
    description: string

    /** longer bio / personality, humour, hobbies, etc. */
    @Prop({ default: '' })
    bio: string

    /** how the user wants the character to look (drives the avatar) */
    @Prop({ default: '' })
    appearance: string

    /** generated avatar image URL (empty while pending) */
    @Prop({ default: '' })
    avatar: string

    /** topics this character is an expert in */
    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }], default: [] })
    expertise: Types.ObjectId[]

    /** pending = being generated; ready = usable; failed = generation errored */
    @Prop({ enum: ['pending', 'ready', 'failed'], default: 'pending' })
    status: 'pending' | 'ready' | 'failed'
}

export const CharacterSchema = SchemaFactory.createForClass(Character)
