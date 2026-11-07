import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService: JwtService) {}

    private async issueToken(userId: unknown): Promise<{token: string}> {
        const payload = { sub: userId, userId }
        return {
            token: await this.jwtService.signAsync(payload)
        }
    }

    async signUp(username: string, email: string, pass: string): Promise<{token: string}> {
        const password = await bcrypt.hash(pass, 10)
        const user = await this.usersService.create(username, email, password)
        return this.issueToken(user._id)
    }

    async signIn(email: string, pass: string): Promise<{token: string}> {
        const user = await this.usersService.findOne(email)

        if (!user) {
            throw new UnauthorizedException();
        }

        const isMatch = await bcrypt.compare(pass, user.password)
        if (!isMatch) {
            throw new UnauthorizedException();
        }

        return this.issueToken(user._id)
    }

}

