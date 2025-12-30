import { Module } from '@nestjs/common';
import { FileStorageService } from './file-storage.service';
import { AwsStorageService } from './aws-storage.service';

@Module({
  providers: [FileStorageService, AwsStorageService],
  exports: [FileStorageService]
})
export class FileStorageModule {}
