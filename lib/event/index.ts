import {ClientEvents} from 'discord.js';

export interface Event {
  /** Use `EventEmitter::once` instead of `EventEmitter::on` */
  once?: boolean;
}

export abstract class Event {
  abstract event: keyof ClientEvents;

  abstract handle(args: ClientEvents[keyof ClientEvents]): Promise<void>;
}

/** Use `EventEmitter::once` instead of `EventEmitter::on` */
export function Once(f: Function) {
  f.prototype.once = true;
}
