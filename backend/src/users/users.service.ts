import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './users.schema';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) {}

    async findOne(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ email }).exec()
    }

    async findById(id: string): Promise<Partial<UserDocument>> {
        const user = await this.userModel.findById(id).exec()
        if (!user) {
            throw new NotFoundException()
        }
        return {
            _id: user._id,
            username: user?.username,
            email: user?.email,
        }
    }
}
