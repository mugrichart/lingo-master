import { Transform } from "class-transformer";
import { IsArray, IsBoolean, IsNotEmpty, IsOptional } from "class-validator";
import { Types } from "mongoose";

export class QueryTopicLearningPlanDto {
    @IsOptional()
    @Transform(( { value }) => Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : value )
    topic: Types.ObjectId

    @IsOptional()
    @Transform(( { value }) => Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : value )
    user: Types.ObjectId
}