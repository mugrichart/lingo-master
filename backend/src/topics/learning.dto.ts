import { Transform, Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsBoolean, IsIn, IsInt, IsMongoId, IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Types } from "mongoose";
import type { PracticeStage } from "./topics.schema";

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

    /** When true, the resulting overallScore is stored as the user's topic mastery (topic-wide tests only). */
    @IsOptional()
    @IsBoolean()
    persistMastery?: boolean
}

export class RecordCoveredWordsDto {
    @ApiProperty({ example: '680563f011b9fed85c030f85', description: 'Topic ID being practiced.' })
    @IsMongoId()
    topic: string

    @ApiProperty({
        example: ['6846f176dd2d878cd60bedfc'],
        description: 'Word IDs covered during manual practice.'
    })
    @IsArray()
    @ArrayMinSize(1)
    @IsMongoId({ each: true })
    words: string[]
}

export class LearningWordProgressDto {
    @ApiProperty({ example: '6846f176dd2d878cd60bedfc' })
    @IsMongoId()
    word: string

    @ApiProperty({ example: 1, minimum: 0 })
    @IsInt()
    @Min(0)
    level: number
}

export class UpdateLearningProgressDto {
    @ApiProperty({ example: '680563f011b9fed85c030f85' })
    @IsMongoId()
    topic: string

    @ApiProperty({ example: 1, minimum: 0, description: 'Zero-based chunk index to resume from.' })
    @IsInt()
    @Min(0)
    chunkIndex: number

    @ApiProperty({ example: 2, minimum: 0 })
    @IsInt()
    @Min(0)
    chunkLevel: number

    @ApiPropertyOptional({ enum: ['word-practice', 'conversation-practice', 'complete'], default: 'word-practice' })
    @IsOptional()
    @IsString()
    @IsIn(['word-practice', 'conversation-practice', 'complete'])
    practiceStage?: PracticeStage

    @ApiPropertyOptional({ type: [LearningWordProgressDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LearningWordProgressDto)
    words?: LearningWordProgressDto[]
}
