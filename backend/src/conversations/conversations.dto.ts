import { Transform, Type } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested } from "class-validator";
import { Types } from "mongoose";

class ConversationLineDto {
    @IsNumber()
    actor: number;

    @IsString()
    text: string;

    @IsString()
    blankedText: string;

    @IsArray()
    @IsString({ each: true })
    usedWords: string[];
}

export class CreateConversationDto {
    @IsNotEmpty()
    @Transform(({ value }) => Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : value)
    topicId: Types.ObjectId

    @IsString() title: string;
    @IsString() description: string;
    @IsArray() @IsString({ each: true }) characters: string[];

    @IsArray()
    @ValidateNested({ each: true})
    @Type(() => ConversationLineDto)
    lines: ConversationLineDto[]
}

export class ConversationSuggestionExpansionDto {
    @IsString() topic: string;
    @IsString() title: string;
    @IsString() description: string;

    @IsArray()
    @IsString({ each: true})
    suggestedWords: string[]
}