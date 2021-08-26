import {Message} from 'discord.js';
import {Guard, _Guard} from '.';

export class RequireAdmin extends _Guard {
  async check(msg: Message): Promise<boolean> {
    return process.env.admins?.split(',').includes(msg.author.id) || false;
  }
}

/**
 * Requires the user executing the command to be bot administrator.
 */
export const Admin = Guard(RequireAdmin);
