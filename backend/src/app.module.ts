import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TopicsModule } from './topics/topics.module';
import { WordsModule } from './words/words.module';
import configuration from './config/configuration';

@Module({
  imports: [
    AuthModule, 
    UsersModule,
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('db.MONGO_URI')
      })
    }),
    TopicsModule,
    WordsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
