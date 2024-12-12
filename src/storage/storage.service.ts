import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Storage } from '@google-cloud/storage';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService implements OnModuleInit, OnModuleDestroy {
  private storage: Storage;
  private commonBucketName: string;
  private userProjectsBucketName: string;
  private keyFilePath: string;

  constructor(private readonly configService: ConfigService) {
    this.commonBucketName = this.configService.get<string>(
      'GCS_COMMON_BUCKET',
      'common-studio-resources',
    );
    this.userProjectsBucketName = this.configService.get<string>(
      'GCS_PROJECTS_BUCKET',
      'user-projects',
    );

    this.keyFilePath = path.resolve(__dirname, 'service-account-key.json');
    const base64Key = this.configService.get<string>('GCS_KEY_BASE64');
    if (base64Key) {
      const decodedKey = Buffer.from(base64Key, 'base64').toString('utf-8');
      fs.writeFileSync(this.keyFilePath, decodedKey);
    }

    this.storage = new Storage({
      keyFilename: this.keyFilePath,
    });
  }

  async generatePresignedUrlForFile(filePath: string): Promise<string> {
    const bucket = this.storage.bucket(this.commonBucketName);
    const file = bucket.file(filePath);

    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 3600 * 1000,
    });

    return url;
  }

  async createUserProjectFolder(userId: string): Promise<void> {
    const bucket = this.storage.bucket(this.userProjectsBucketName);
    const folderPath = `${userId}/`;

    const [exists] = await bucket.file(`${folderPath}placeholder`).exists();
    if (!exists) {
      await bucket.file(`${folderPath}placeholder`).save('', {
        resumable: false,
        metadata: { contentType: 'text/plain' },
      });
    }
  }

  async generateUploadPresignedUrl(
    userId: string,
    projectId: string,
  ): Promise<string> {
    const bucket = this.storage.bucket(this.userProjectsBucketName);
    const filePath = `${userId}/${projectId}.zip`;

    const [url] = await bucket.file(filePath).getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 3600 * 1000, // 1-hour expiration
      contentType: 'application/zip',
    });

    return url;
  }

  async generateDownloadPresignedUrl(
    userId: string,
    projectId: string,
  ): Promise<string> {
    const bucket = this.storage.bucket(this.userProjectsBucketName);
    const filePath = `${userId}/${projectId}.zip`;

    const [url] = await bucket.file(filePath).getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 3600 * 1000, // 1-hour expiration
    });

    return url;
  }

  onModuleDestroy() {
    if (fs.existsSync(this.keyFilePath)) {
      fs.unlinkSync(this.keyFilePath);
    }
  }

  onModuleInit() {
    console.log('StorageService initialized');
  }
}
