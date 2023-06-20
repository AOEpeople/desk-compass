import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { Registry } from './registry';

@Module({
  imports: [DiscoveryModule],
  providers: [Registry],
  exports: [Registry],
})
export class RegistryModule {}
