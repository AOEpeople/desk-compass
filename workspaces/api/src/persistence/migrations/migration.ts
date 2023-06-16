import * as jq from 'node-jq';
import { Logger } from '@nestjs/common';

export abstract class Migration {
  private readonly logger = new Logger(Migration.name);

  abstract version(): number;
  abstract isApplicable(jsonContent: string): boolean;
  abstract getTransformation(): string;

  async migrate(jsonContent: string, humanReadable: boolean): Promise<string> {
    if (!this.isApplicable(jsonContent)) {
      this.logger.debug(
        `Migration to version ${this.version()} is not applicable, skipped`,
      );
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
