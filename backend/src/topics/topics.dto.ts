import { Transform } from "class-transformer";
import { IsArray, IsBoolean, IsOptional, IsString } from "class-validator";

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
    @IsOptional() @IsString() parent?: string;
    @IsOptional()
    @Transform(({ value }) => value === true || value === 'true')
    @IsBoolean()
    isAiGenerated?: boolean
}

export class UpdateTopicDto {
    @IsOptional() @IsString() name?: string;
    @IsOptional() @IsString() language?: string;
}

export class GenerateTopicSuggestionsDto {
    @IsOptional() @IsString() parentTopic?: string;
    @IsOptional() @IsArray() @IsString({ each: true }) alreadyExistingTopics?: string[]
}