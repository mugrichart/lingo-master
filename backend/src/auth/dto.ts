import { IsEmail, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SignInDto {
    @ApiProperty({ example: 'you@example.com' })
    @IsEmail() email: string;
    @ApiProperty({ example: 'your-password', format: 'password' })
    @IsString() password: string
}

export class SignUpDto {
    @ApiProperty({ example: 'your-username' })
    @IsString() username: string;
    @ApiProperty({ example: 'you@example.com' })
    @IsEmail() email: string;
    @ApiProperty({ example: 'your-password', format: 'password' })
    @IsString() password: string;
}
