import { promises as p } from 'fs';
import { Injectable, Logger } from '@nestjs/common';
import { Registry } from '../../registry/registry';
import { Migration } from './migration';

@Injectable()
export class MigrationService {
  private migrations: Migration[] = [];

  private readonly logger = new Logger(MigrationService.name);

  constructor(private readonly registry: Registry) {
    this.migrations = this.registry.getProviders<Migration[]>('migration').sort((a, b) => a.version() - b.version());
  }

  async migrate(jsonFilePath: string, humanReadable: boolean): Promise<boolean> {
    let jsonContent: string;

    // check for duplicate versions
    const versions: Set<number> = new Set<number>();
    this.migrations.forEach((m) => {
      versions.add(m.version());
    });
    if (versions.size !== this.migrations.length) {
      const error = new Error('Found duplicate migration version, please check your migration files!');
      this.logger.error(error.message);
      throw error;
    }

    // load file into string
    try {
      const buffer = await p.readFile(jsonFilePath, {
        encoding: 'utf8',
        flag: 'r',
      });
      jsonContent = buffer.toString();
    } catch (e) {
      const error = new Error('Could not read data storage file during migration');
      this.logger.error(error.message, { cause: e });
      throw error;
    }

    // transform
    const result = await this.migrations.reduce(async (previousValue, currentValue) => {
      return await currentValue.migrate(await previousValue, humanReadable);
    }, Promise.resolve(jsonContent));

    // write string back to file
    try {
      await p.writeFile(jsonFilePath, result, 'utf8');
    } catch (e) {
      const error = new Error('Could not write data storage file during migration');
      this.logger.error(error.message, { cause: e });
      throw error;
    }

    return true;
  }
}
