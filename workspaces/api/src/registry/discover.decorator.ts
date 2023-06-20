import { SetMetadata } from '@nestjs/common';
import { REGISTRY_METADATA_KEY } from './registry.constants';

export const Discover = (v: unknown) => SetMetadata(REGISTRY_METADATA_KEY, v);
