import { existsSync, promises as p } from 'fs';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from '@lukeed/uuid';

@Injectable()
export class UploadManagerService {
  public static PROVIDER = 'UploadManagerService';

  private readonly logger = new Logger(UploadManagerService.name);

  constructor(private storagePath: string) {}

  static async init(configService: ConfigService): Promise<string> {
    const logger = new Logger(UploadManagerService.name);
    const storagePath = configService.getOrThrow<string>('imageStoragePath');

    // Check image storage availability
    logger.debug(`Checking image folder ${storagePath}`);
    if (!existsSync(storagePath)) {
      logger.warn('Target folder not found, creating new empty folder');
      try {
        await p.mkdir(storagePath, {
          recursive: true,
          mode: '0700',
        });
      } catch (e) {
        const error = new Error('Could not create image storage folder');
        logger.error(error.message, { cause: e });
        throw error;
      }
    }

    // Check permissions
    try {
      await p.readdir(storagePath);
    } catch (e) {
      const error = new Error('Could not read from image storage folder');
      logger.error(error.message, {
        storagePath: storagePath,
        cause: e,
      });
      throw error;
    }

    return storagePath;
  }

  async get(imageId: string): Promise<Buffer> {
    return p.readFile(`${this.storagePath}/${imageId}`);
  }

  async upload(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('Missing upload file');
    }

    const imageId = uuid();
    const imageFile = `${this.storagePath}/${imageId}`;
    await p.writeFile(imageFile, file.buffer);
    this.logger.debug(`Wrote image to ${imageFile}`);
    return imageId;
  }

  async delete(imageId: string): Promise<void> {
    return p.unlink(`${this.storagePath}/${imageId}`);
  }

  async isHealthy(): Promise<boolean> {
    const healthCheckFile = `${this.storagePath}/health-check`;
    try {
      await p.readdir(this.storagePath);
      await p.writeFile(healthCheckFile, '');
      await p.unlink(healthCheckFile);
      return true;
    } catch (error) {
      this.logger.warn('UploadManager health check failed', { cause: error });
      return false;
    }
  }
}
