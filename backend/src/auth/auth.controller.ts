import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService){}

    @HttpCode(HttpStatus.OK)
    @Post('login')
    signIn(@Body() signInDto: Record<'email' | 'password', any>) {
        return this.authService.signIn(signInDto.email, signInDto.password)
    }

    @Get('profile')
    getProfile(@Request() req) {
        return req.user
    }
}
