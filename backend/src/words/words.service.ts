import { forwardRef, Inject, Injectable, NotFoundException, NotImplementedException } from '@nestjs/common';
import { CreateWordDto, WordsQueryDto } from './words.dto';
import { TopicsService } from 'src/topics/topics.service';
import { InjectModel } from '@nestjs/mongoose';
import { Word, WordDocument } from './words.schema';
import { Model, Types } from 'mongoose';

import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class WordsService {
    constructor(
        @InjectConnection() private connection: Connection,
        @InjectModel(Word.name) private wordModel: Model<Word>,

        @Inject(forwardRef(() => TopicsService))
        private topicService: TopicsService, 
    ) {}

    async findAll(query: WordsQueryDto): Promise<(WordDocument | null)[]> {
        if (query.topic) {
            const topic = await this.topicService.findOne(query.topic)
            if (!topic) throw new Error("Error finding the topic of the words")
            const wordIDs = topic?.words
            return Promise.all(wordIDs?.map(async id => this.findOne(id)))
        }
        if (query.search) {
            throw new NotImplementedException()
        }
        else return this.wordModel.find()
    }

    async findOne(id: Types.ObjectId): Promise<WordDocument | null> {
        return this.wordModel.findById(id)
    }

    async create(createWordDto: CreateWordDto): Promise<WordDocument> {
        const session = await this.connection.startSession()
        session.startTransaction()
        try {
             const topic = await this.topicService.findOne(createWordDto.topicID)
            if (!topic) {
                throw new NotFoundException(`Topic with id ${createWordDto.topicID} not found`)
            }
            const [word] = await this.wordModel.create(
                [ {...createWordDto, language: topic.language } ],
                { session }
            )

            await this.topicService.addNewWord( topic._id, word._id, session)
            await session.commitTransaction()
            return word
        } catch (error) {
            console.error(error.message)
            await session.abortTransaction()
            throw error
        }
        finally {
            await session.endSession()
        }
       
    }
}
