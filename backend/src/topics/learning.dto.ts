import { Transform, Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";
import { Types } from "mongoose";

export class QueryTopicLearningPlanDto {
    @IsOptional()
    @Transform(( { value }) => Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : value )
    topic: Types.ObjectId

    @IsOptional()
    @Transform(( { value }) => Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : value )
    user: Types.ObjectId
}

export class WordAttemptRecordDto {
    @IsString()
    word: string

    @IsString()
    meaning: string

    @IsString()
    userDefinition: string

    @IsString()
    example: string

 @IsString()
    userSentence: string
}

export class ScoreLearningAttemptDto {
    @IsNotEmpty()
    @Transform(( { value }) => Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : value )
    topic: Types.ObjectId

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => WordAttemptRecordDto)
    records: WordAttemptRecordDto[]
}