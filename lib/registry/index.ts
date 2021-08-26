import {Collection} from 'discord.js';

// TODO: move CommandRegistry to lib/registry/command.ts

export abstract class Registry<K, V> extends Collection<K, V> {
  register(key: K, val: V): this {
    this.set(key, val);
    return this;
  }
}

export * from './cmd';
export * from './lang';
