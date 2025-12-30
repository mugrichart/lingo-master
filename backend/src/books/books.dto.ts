import { Transform, Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { Types } from "mongoose";

export class UploadMetadataDto {
    @IsString() title: string
    @IsString() author: string

    @IsNumber() 
    @Type(() => Number)
    pageCount: number

    @IsNumber() 
    @Type(() => Number)
    startingPage: number

    @IsNumber() 
    @Type(() => Number)    
    endingPage: number
}


export class QueryPracticePageDto {
    @IsNotEmpty()
    @Transform(({ value }) => Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : value)
    bookId: Types.ObjectId

    @IsOptional()
    @Type(() => Number)
    pageNumber?: number
}