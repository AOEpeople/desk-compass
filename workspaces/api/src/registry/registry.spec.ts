import { beforeEach, vi } from 'vitest';
import { Injectable } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { V1ToV2Migration } from '../persistence/migrations/v1-to-v2.migration';
import { Migration } from '../persistence/migrations/migration';
import { Discover } from './discover.decorator';
import { Registry } from './registry';

@Injectable()
@Discover('example')
class Sample {}

describe('Registry', () => {
  const discoveryService = {
    getProviders: vi.fn(),
  } as any as DiscoveryService;
  const providers = [
    { metatype: V1ToV2Migration, instance: vi.fn(), name: 'first' },
    { metatype: V1ToV2Migration, instance: null, name: 'second' },
    { metatype: Sample, instance: null, name: 'third' },
  ] as InstanceWrapper<any>[];
  let registry: Registry;

  beforeEach(() => {
    vi.spyOn(discoveryService, 'getProviders').mockReturnValue(providers);

    registry = new Registry(discoveryService);
  });

  describe('getProviders', () => {
    it('should have no providers', () => {
      vi.spyOn(discoveryService, 'getProviders').mockReturnValue([]);
      const registry = new Registry(discoveryService);

      const actual = registry.getProviders<any>();

      expect(actual).toHaveLength(0);
    });

    it('should retrieve providers with "Discover" annotation', () => {
      const actual = registry.getProviders();

      expect(actual).toHaveLength(3);
    });

    it('should retrieve providers with "Discover" annotation by key', () => {
      const actual = registry.getProviders<Migration[]>('migration');

      expect(actual).toHaveLength(2);
    });
  });
});
