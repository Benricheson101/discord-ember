import {createSetDecorator} from '../../util';
import {Message} from 'discord.js';

/**
 * The base class all Guards are derived from.
 */
export abstract class _Guard {
  /**
   * The check function that determines whether or not a command
   * can be executed by a user.
   */
  abstract check(msg: Message): Promise<boolean>;
}

export const Guard = createSetDecorator<typeof _Guard>('guards');

export * from './admin';
export * from './disabled';
