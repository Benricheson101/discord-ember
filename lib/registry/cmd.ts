import {Command} from '../cmd';
import {Registry} from '.';

export class CommandRegistry extends Registry<string, Command> {
  constructor() {
    super();
  }

  // TODO: is there a way to get rid of the name param?
  /**
   * Register a command
   */
  register<T extends Command>(name: string, c: T): this {
    this.set(name, c);
    return this;
  }

  /**
   * Register a command
   */
  registerCmd<T extends Command>(c: T): this {
    if (!c.name && !c.slash?.name) {
      throw new Error(
        `Command located at ${c.location} could not be registered as it does not have a name`
      );
    }

    return this.register(c.name || c.slash!.name, c);
  }

  /**
   * Find a top-level command by its name or one of its aliases
   */
  get(c: string): Command | undefined {
    return this.find(({name, aliases}) => name === c || !!aliases?.includes(c));
  }
}
