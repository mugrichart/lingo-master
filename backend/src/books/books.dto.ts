import { Type } from "class-transformer";
import { IsNumber, IsString } from "class-validator";

export class UploadMetadataDto {
    @IsString() title: string
    @IsString() author: string

    @IsNumber() 
    @Type(() => Number)
    pageCount: number

    @IsNumber() 
    @Type(() => Number)
    startingPage: number

    @IsNumber() 
    @Type(() => Number)    
    endingPage: number
}
