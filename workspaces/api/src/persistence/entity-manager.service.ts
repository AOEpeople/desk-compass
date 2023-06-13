import { existsSync, promises as p } from 'fs';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as uuid from '@lukeed/uuid';
import { JsonDB, Config } from 'node-json-db';
import { Entity } from './entities/entity';
import { EntityType } from './entities/entity.type';

@Injectable()
export class EntityManagerService {
  public static PROVIDER = 'EntityManagerService';

  private readonly logger = new Logger(EntityManagerService.name);

  constructor(private db: JsonDB) {}

  static async init(configService: ConfigService): Promise<JsonDB> {
    const logger = new Logger(EntityManagerService.name);
    const dbPath = configService.getOrThrow<string>('database.path');
    const dbFile = 'data.json';
    const dbFilePath = `${dbPath}/${dbFile}`;

    // Check data storage availability
    logger.debug(`Checking data folder ${dbFilePath}`);
    if (!existsSync(dbFilePath)) {
      logger.warn('Target file not found, creating new empty database file');
      if (!existsSync(dbPath)) {
        try {
          await p.mkdir(dbPath, {
            recursive: true,
            mode: '1600',
          });
        } catch (e) {
          const error = new Error('Could not create data folder');
          logger.error(error.message, { cause: e });
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
        logger.error(error.message, { cause: e });
        throw error;
      }
    }

    // Check permissions
    try {
      await p.readFile(dbFilePath, { flag: 'r' });
    } catch (e) {
      const error = new Error('Could not read data storage file');
      logger.error(error.message, { cause: e });
      throw error;
    }

    logger.debug('Loading database from ' + dbFilePath);
    const humanReadable = configService.get<boolean>('database.humanReadable');
    return new JsonDB(new Config(dbFilePath, true, humanReadable, '/', true));
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
