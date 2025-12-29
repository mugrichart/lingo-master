import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";
import type { languageStyle, types } from "./words.schema";
import { Types } from "mongoose";
import { Transform } from "class-transformer";

export class WordsQueryDto {
    @IsOptional()
    @Transform(({ value }) => Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : value)
    topic?: Types.ObjectId;

    @IsOptional() @IsString() search?: string;
}

export class CreateWordDto {
    @IsNotEmpty()
    @Transform(({ value }) => Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : value)
    topicID: Types.ObjectId;

    @IsString() 
    type: string;

    @IsString() 
    "language style": string; 

    @IsString() 
    word: string;

    @IsString()
    example: string;

    @IsString()
    "blanked example": string;

    @IsString() 
    meaning: string;

    @IsString()
    synonym: string;

    @IsString()
    antonym: string

    @IsOptional()
    @IsArray()
    @Transform(({ value }) => {
        return Array.isArray(value) 
            ? value.map(id => Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : id) 
            : value;
    })
    "related words"?: Types.ObjectId[];
}

export class GenerateWordSuggestionsDto {
    @IsString() topic: string;
    @IsOptional() @IsArray() @IsString({ each: true}) alreadyExistingWords?: string[]
}

export class ExpandWordSuggestionDto {
    @IsString() word: string;
    @IsString() example: string;
}