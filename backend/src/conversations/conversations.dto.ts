import { IsArray, IsString } from "class-validator";


export class ConversationSuggestionExpansionDto {
    @IsString() title: string;
    @IsString() description: string;

    @IsArray()
    @IsString({ each: true})
    suggestedWords: string[]
}