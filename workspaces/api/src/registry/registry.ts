import { Injectable, Logger } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import iterate from 'iterare';

import { REGISTRY_METADATA_KEY } from './registry.constants';

@Injectable()
export class Registry {
  private readonly logger = new Logger(Registry.name);

  private providers: Record<string | symbol, unknown[]> = {};

  constructor(private readonly discoveryService: DiscoveryService) {
    this.providers = this.scanDiscoverableInstanceWrappers(this.discoveryService.getProviders());
  }

  public getProviders<T extends unknown[]>(key?: string | symbol): T {
    const providers = key ? this.providers[key] : Object.values(this.providers).flat();
    return providers as T;
  }

  private scanDiscoverableInstanceWrappers(wrappers: { metatype: unknown | null; instance: unknown; name: string }[]) {
    return iterate(wrappers)
      .filter(({ metatype }) => metatype && this.getMetadata(metatype))
      .reduce((acc, { metatype, instance }) => {
        const type = this.getMetadata(metatype);

        return {
          ...acc,
          [type]: (acc[type] || []).concat(instance),
        };
      }, {});
  }

  private getMetadata(metatype: unknown) {
    return Reflect.getMetadata(REGISTRY_METADATA_KEY, metatype);
  }
}
