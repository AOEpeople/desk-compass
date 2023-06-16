import { promises as p } from 'fs';
import { Injectable, Logger } from '@nestjs/common';
import { Migration } from './migration';
import { V1ToV2Migration } from './v1-to-v2.migration';

@Injectable()
export class MigrationService {
  private migrations: Migration[] = [];

  private readonly logger = new Logger(MigrationService.name);

  constructor(private readonly v1ToV2Migration: V1ToV2Migration) {
    this.migrations.push(v1ToV2Migration);
  }

  async migrate(
    jsonFilePath: string,
    humanReadable: boolean,
  ): Promise<boolean> {
    let jsonContent: string;

    // load file into string
    try {
      const buffer = await p.readFile(jsonFilePath, {
        encoding: 'utf8',
        flag: 'r',
      });
      jsonContent = buffer.toString();
    } catch (e) {
      const error = new Error(
        'Could not read data storage file during migration',
      );
      this.logger.error(error.message, { cause: e });
      throw error;
    }

    // transform
    const result = await this.migrations.reduce(
      async (previousValue, currentValue) => {
        return await currentValue.migrate(await previousValue, humanReadable);
      },
      Promise.resolve(jsonContent),
    );

    // write string back to file
    try {
      await p.writeFile(jsonFilePath, result, 'utf8');
    } catch (e) {
      const error = new Error(
        'Could not write data storage file during migration',
      );
      this.logger.error(error.message, { cause: e });
      throw error;
    }

    return true;
  }
}
