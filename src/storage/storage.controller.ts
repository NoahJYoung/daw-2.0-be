import { Controller, Get, Query } from '@nestjs/common';
import { StorageService } from './storage.service';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Get('common-resource')
  async getCommonResourceUrl(@Query('filePath') filePath: string) {
    return {
      url: await this.storageService.generatePresignedUrlForFile(filePath),
    };
  }
}
