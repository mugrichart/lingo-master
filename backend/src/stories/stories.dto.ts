import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class StartStoryDto {
    @IsNotEmpty()
    @IsString()
    topicId: string;
}

export class SendStoryMessageDto {
    @IsNotEmpty()
    @IsString()
    text: string;
}
