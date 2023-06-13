import type { Writable } from 'svelte/types/runtime/store';

export interface RemoteWritable<T> extends Writable<T[]> {
  init(): Promise<boolean>;
  createItem(obj: T): void;
  updateItem(obj: T): void;
  deleteItem(obj: T): void;
}
