import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileType } from './storage.types';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

@Injectable()
export class AwsStorageService {
    private readonly s3: S3Client;

    constructor(private configService: ConfigService) {
        // Initialize here so configService is definitely defined
        this.s3 = new S3Client({
            region: this.configService.get<string>('aws.AWS_REGION')!,
            credentials: {
                accessKeyId: this.configService.get<string>('aws.AWS_ACCESS_KEY_ID')!,
                secretAccessKey: this.configService.get<string>('aws.AWS_SECRET_ACCESS_KEY')!,
            },
        });
    }

    async upload(buffer: Buffer, key: string, contentType: FileType) {
        const command = new PutObjectCommand({
            Bucket: this.configService.get<string>('aws.AWS_BUCKET_NAME'), // Use configService, not process.env
            Key: key,
            Body: buffer,
            ContentType: contentType,
        });

        await this.s3.send(command);
    }
}
