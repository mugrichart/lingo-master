import { Transform } from "class-transformer";
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Types } from "mongoose";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class CreateTopicDto {
    @IsString() name: string;
    @IsString() language: string;

    @IsOptional() @IsString() parent?: string;
    
    @IsOptional()
    @Transform(({ value }) => value == true || value === 'true')
    @IsBoolean()
    isAiGenerated?: boolean
}

export class ListAllTopicsDto {
    @ApiPropertyOptional({ example: 'science' })
    @IsOptional() @IsString() name?: string;
    @ApiPropertyOptional({ example: 'english', default: 'english' })
    @IsOptional() @IsString() language?: string;
    @ApiPropertyOptional({
        example: '6805438f3e55b8ff265608d7',
        description: 'MongoDB user ID of the creator. Do not use the username or email address.'
    })
    @IsOptional() @IsString() creator?: string;

    @ApiPropertyOptional({ example: 'PARENT_TOPIC_ID', description: 'Use null for top-level topics.' })
    @IsOptional() 
    @IsString() 
    @Transform(({ value }) => value == "null" ? null : value)
    parent?: string | null;
    
    @ApiPropertyOptional({ example: false, default: false })
    @IsOptional()
    @Transform(({ value }) => value === true || value === 'true')
    @IsBoolean()
    isAiGenerated?: boolean
}

export class UpdateTopicDto {
    @IsOptional() @IsString() name?: string;
    @IsOptional() @IsString() language?: string;
    
    @IsOptional()
    @Transform(({ value }) => Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : value)
    parent?: Types.ObjectId
}

// ------------------------------------------------
export class GenerateTopicSuggestionsDto {
    @IsOptional() @IsString() parentTopic?: string;
    @IsOptional() @IsArray() @IsString({ each: true }) alreadyExistingTopics?: string[]
}

//-------------------------------------------------
export class QueryAutoFindTopicDto {
    @IsOptional()
    @Transform(({ value }) => Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : value)
    topicId: Types.ObjectId
}
