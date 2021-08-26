import {Schema} from 'joi';
import {CommandArg, ArgKind} from '.';

/**
 * Add an argument to the argument schema
 */
export function Arg<T>(ops: ArgOptions<T>): ClassDecorator {
  return ({prototype: p}: Function) => {
    if (p.argSchema) {
      if (p.argSchema.find((a: ArgOptions<unknown>) => a.name === ops.name)) {
        throw new Error('Duplicate argument name');
      }

      p.argSchema.push(ops);
    } else {
      p.argSchema = [ops];
    }
  };
}

export interface ArgOptions<T = unknown> {
  /** The name of the argument */
  name: string;
  /**
   * What the argument is
   *
   * Includes basic validation and
   * transformation as needed
   */
  kind?: ArgKind;
  /**
   * Custom validation using Joi
   */
  validate?: Schema;

  /**
   * Modify the argument
   */
  transform?: (arg: CommandArg) => T;

  /**
   * If the argument is required or not
   */
  required?: boolean;

  /**
   * A description of the argument
   */
  description?: string;
}
