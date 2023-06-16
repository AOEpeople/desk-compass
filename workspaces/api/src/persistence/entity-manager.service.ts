import { existsSync, promises as p } from 'fs';
import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as uuid from '@lukeed/uuid';
import { JsonDB, Config } from 'node-json-db';
import { Entity } from './entities/entity';
import { EntityType } from './entities/entity.type';
import { MigrationService } from './migrations/migration.service';

@Injectable()
export class EntityManagerService implements OnModuleInit {
  public static PROVIDER = 'EntityManagerService';

  private readonly logger = new Logger(EntityManagerService.name);

  private db: JsonDB;

  constructor(
    private readonly configService: ConfigService,
    private readonly migrationService: MigrationService,
  ) {}

  async onModuleInit(): Promise<void> {
    const dbPath = this.configService.getOrThrow<string>('database.path');
    const dbFile = 'data.json';
    const dbFilePath = `${dbPath}/${dbFile}`;

    // Check data storage availability
    this.logger.debug(`Checking data folder ${dbFilePath}`);
    if (!existsSync(dbFilePath)) {
      this.logger.warn(
        'Target file not found, creating new empty database file',
      );
      if (!existsSync(dbPath)) {
        try {
          await p.mkdir(dbPath, {
            recursive: true,
            mode: '1600',
          });
        } catch (e) {
          const error = new Error('Could not create data folder');
          this.logger.error(error.message, { cause: e });
          throw error;
        }
      }
      try {
        const baseContent = { bgFloorplan: { id: 'bgFloorplan' }, marker: {} };
        await p.writeFile(dbFilePath, JSON.stringify(baseContent), {
          mode: '600',
          flag: 'w+',
          encoding: 'utf-8',
        });
      } catch (e) {
        const error = new Error('Could not create data storage file');
        this.logger.error(error.message, { cause: e });
        throw error;
      }
    }

    // Check permissions
    try {
      await p.readFile(dbFilePath, { flag: 'r' });
    } catch (e) {
      const error = new Error('Could not read data storage file');
      this.logger.error(error.message, { cause: e });
      throw error;
    }

    this.logger.debug('Loading database from ' + dbFilePath);
    const humanReadable = this.configService.get<boolean>(
      'database.humanReadable',
    );

    await this.migrationService.migrate(dbFilePath, humanReadable);

    this.db = new JsonDB(
      new Config(dbFilePath, true, humanReadable, '/', true),
    );
  }

  async getAll<Type extends Entity>(entityType: EntityType): Promise<Type[]> {
    this.logger.debug(`Load all ${entityType}`);
    const data = await this.db.getData(`${entityType}`);
    return Object.values(data);
  }

  async get<Type extends Entity>(
    entityType: EntityType,
    id: string,
  ): Promise<Type> {
    this.logger.debug(`Load ${entityType} ${id}`);
    try {
      return await this.db.getObject<Type>(`${entityType}/${id}`);
    } catch (error) {
      throw new NotFoundException('Entity does not exist');
    }
  }

  async create<Type extends Entity>(
    entityType: EntityType,
    entity: Type,
  ): Promise<Type> {
    this.logger.debug(`Create new ${entityType}`);
    if (!entity.id) {
      entity.id = uuid.v4();
    }
    await this.db.push(`${entityType}/${entity.id}`, entity);
    return entity;
  }

  async update<Type extends Entity>(
    entityType: EntityType,
    entity: Type,
  ): Promise<Type> {
    this.logger.debug(`Update existing ${entityType} ${entity.id}`);
    try {
      await this.db.getObject<Type>(`${entityType}/${entity.id}`);
      await this.db.push(`${entityType}/${entity.id}`, entity, true);
      return entity;
    } catch (error) {
      throw new NotFoundException('Entity does not exist', { cause: error });
    }
  }

  async delete<Type extends Entity>(entityType: EntityType, entity: Type) {
    this.logger.debug(`Delete ${entityType} ${entity.id}`);
    try {
      await this.db.delete(`${entityType}/${entity.id}`);
    } catch (error) {
      throw new NotFoundException('Entity does not exist', { cause: error });
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.db.reload();
      await this.db.save();
      return await this.db.exists('/');
    } catch (error) {
      this.logger.warn('EntityManager health check failed', { cause: error });
      return false;
    }
  }
}
