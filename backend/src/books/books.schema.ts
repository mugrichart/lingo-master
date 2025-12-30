import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { type Service } from "src/file-storage/storage.types";

export type BookDocument = HydratedDocument<Book>

@Schema()
export class Book {
    @Prop()
    title: string

    @Prop()
    author: string

    @Prop()
    pageCount: number

    @Prop()
    startingPage: number

    @Prop()
    endingPage: number

    @Prop()
    pdfUrl: string

    @Prop()
    coverUrl: string

    @Prop({ default: 'AWS'})
    storageService: Service

}

export const BookSchema = SchemaFactory.createForClass(Book)