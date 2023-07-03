import * as jq from 'node-jq';
import { Logger } from '@nestjs/common';

export abstract class Migration {
  private readonly logger = new Logger(Migration.name);

  abstract version(): number;

  abstract isApplicable(jsonContent: string): boolean;

  abstract getTransformation(): string;

  async migrate(jsonContent: string, humanReadable: boolean): Promise<string> {
    const obj = JSON.parse(jsonContent);
    if (!this.isApplicable(jsonContent)) {
      if (obj['version'] >= this.version()) {
        this.logger.debug(`Migration to version ${this.version()} is already applied, skipped`);
      } else {
        this.logger.error(`Migration to version ${this.version()} is not applicable, skipped`);
      }
      return jsonContent;
    }

    this.logger.debug(`Starting migration to version ${this.version()}`);

    const transformer = this.getTransformation();
    const options = {
      input: 'string',
      output: humanReadable ? 'pretty' : 'compact',
    };

    const result = await jq.run(`. | ${transformer}`, jsonContent, options);

    this.logger.log(`Applied migration to version ${this.version()}`);
    return result.toString();
  }
}
