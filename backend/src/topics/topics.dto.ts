import { Transform } from "class-transformer";
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Types } from "mongoose";

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
    @IsOptional() @IsString() name?: string;
    @IsOptional() @IsString() language?: string;
    @IsOptional() @IsString() creator?: string;

    @IsOptional() 
    @IsString() 
    @Transform(({ value }) => value == "null" ? null : value)
    parent?: string | null;
    
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
