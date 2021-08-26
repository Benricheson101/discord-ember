import {Client as DiscordClient, ClientOptions} from 'discord.js';

export class Client extends DiscordClient {
  constructor(ops: ClientOptions) {
    super(ops);
  }
}

// declare module 'discord.js' {
//   export interface ClientOptions {}
// }
