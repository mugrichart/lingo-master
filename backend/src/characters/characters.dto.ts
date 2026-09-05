import { Transform } from "class-transformer";
import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Types } from "mongoose";

const toObjectId = ({ value }: { value: any }) =>
    Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : value

export class CreateCharacterDto {
    @IsOptional()
    @IsString()
    name?: string

    @IsOptional()
    @IsString()
    appearance?: string

    @IsOptional()
    @IsString()
    description?: string
}

export class ChatMessageDto {
    @IsString()
    @IsNotEmpty()
    text: string
}

export class AddExpertiseDto {
    @IsNotEmpty()
    @Transform(toObjectId)
    topic: Types.ObjectId
}
