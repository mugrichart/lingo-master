import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService, private jwtService: JwtService) {}

    async signIn(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(email)

        if (!user) {
            throw new UnauthorizedException();
        }

        const isMatch = await bcrypt.compare(pass, user.password)
        if (!isMatch) {
            throw new UnauthorizedException();
        }

        const payload = { sub:  user._id }

        return {
            token: await this.jwtService.signAsync(payload)
        }
    }

}

