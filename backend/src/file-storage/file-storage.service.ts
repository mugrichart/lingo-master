import { Injectable } from '@nestjs/common';
import { AwsStorageService } from './aws-storage.service';
import { FileType, Service } from './storage.types';

@Injectable()
export class FileStorageService {
    
    constructor(
        private awsStorageService: AwsStorageService
    ){}

    async upload(buffer: Buffer, key: string, contentType: FileType, service?: Service) {
        await this.awsStorageService.upload(buffer, key, contentType)
    }

}
