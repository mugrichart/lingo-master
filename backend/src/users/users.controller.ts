import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { GetUser } from 'src/auth/get-user.decorator';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService){}

    @Get('/profile')
    getProfile(@GetUser('userId') id: string) {
        return this.usersService.findById(id)
    }
}
