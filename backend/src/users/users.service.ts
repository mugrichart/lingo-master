import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './users.schema';
import { Model } from 'mongoose';
import { ConflictException } from '@nestjs/common';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) {}

    async findOne(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({ email }).exec()
    }

    async create(username: string, email: string, password: string): Promise<UserDocument> {
        const existingUser = await this.userModel.findOne({ $or: [{ email }, { username }] }).exec()
        if (existingUser) {
            throw new ConflictException('A user with that email or username already exists')
        }

        return this.userModel.create({ username, email, password })
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
