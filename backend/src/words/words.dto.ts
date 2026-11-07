import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";
import type { languageStyle, types } from "./words.schema";
import { Types } from "mongoose";
import { Transform } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class WordsQueryDto {
    @ApiPropertyOptional({ example: '680563f011b9fed85c030f85', description: 'Topic ID used to filter words.' })
    @IsOptional()
    @Transform(({ value }) => Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : value)
    topic?: Types.ObjectId;

    @ApiPropertyOptional({ example: 'resilient', description: 'Search term.' })
    @IsOptional() @IsString() search?: string;
}

export class CreateWordDto {
    @ApiProperty({ example: '680563f011b9fed85c030f85' })
    @IsNotEmpty()
    @Transform(({ value }) => Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : value)
    topicId: Types.ObjectId;

    @ApiProperty({ example: 'noun' })
    @IsString() 
    type: string;

    @ApiProperty({ example: 'english' })
    @IsString() 
    "language style": string; 

    @ApiProperty({ example: 'resilient' })
    @IsString() 
    word: string;

    @ApiProperty({ example: 'She remained resilient during the challenge.' })
    @IsString()
    example: string;

    @ApiProperty({ example: 'She remained ____ during the challenge.' })
    @IsString()
    "blanked example": string;

    @ApiProperty({ example: 'able to recover quickly from difficulty' })
    @IsString() 
    meaning: string;

    @ApiProperty({ example: 'strong' })
    @IsString()
    synonym: string;

    @ApiProperty({ example: 'fragile' })
    @IsString()
    antonym: string

    @ApiPropertyOptional({ type: [String], example: [] })
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
