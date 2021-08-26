import {parseBoolean} from '../../util';
import {Command} from '..';
import {ArgOptions} from './validation';

export enum ArgFormat {
  UNQUOTED_STRING = 'UNQUOTED_STRING',
  DOUBLE_QUOTED_STRING = 'DOUBLE_QUOTED_STRING',
  SINGLE_QUOTED_STRING = 'SINGLE_QUOTED_STRING',
  INLINE_CODE = 'INLINE_CODE',
  CODE_BLOCK = 'CODE_BLOCK',
}

/**
 * Types of args that a command can take.
 *
 * By default, each will use Joi to validate args.
 */
export enum ArgKind {
  /** Anything (no validation) */
  ANY = 'ANY',
  /** A boolean */
  BOOLEAN = 'BOOLEAN',
  /** Any string from a code block */
  CODE = 'CODE',
  /** Any string */
  STRING = 'STRING',
  /** Floating point number */
  FLOAT = 'FLOAT',
  /** Positive or negative whole number */
  INT = 'INT',
  /** Positive whole number */
  UINT = 'UINT',
  /** A user ID */
  USER = 'USER',
}

/**
 * Parsed command arguments
 */
export class Args {
  public args: CommandArg<string | number | boolean, ArgFormat>[] = [];
  private index = 0;

  constructor(public raw: string) {
    this.args = this.parse(raw);
  }

  /**
   * Split args into an array of Arg
   *
   * Heavily inspired by https://github.com/campbellbrendene/discord-command-parser
   *
   * @param argv Unparsed arguments
   * @returns Parsed arguments
   */
  parse(argv: string): CommandArg<string | number | boolean, ArgFormat>[] {
    let s = argv.trim();
    const args = [];

    while (s.length) {
      let a = 0;

      if (s.startsWith('"') && (a = s.indexOf('"', 1)) > 0) {
        const sub = s.slice(1, a);
        s = s.slice(a + 1);

        args.push(new CommandArg(sub, ArgFormat.DOUBLE_QUOTED_STRING));
      } else if (s.startsWith("'") && (a = s.indexOf("'", 1)) > 0) {
        const sub = s.slice(1, a);
        s = s.slice(a + 1);

        args.push(new CommandArg(sub, ArgFormat.SINGLE_QUOTED_STRING));
      } else if (s.startsWith('```') && (a = s.indexOf('```', 3)) > 0) {
        const sub = s.slice(3, a);
        s = s.slice(a + 3);

        const matchedLang = /^(([a-z]+)?$\n)/m.exec(sub);

        if (matchedLang) {
          const len = matchedLang[1].length;
          const lang = matchedLang[2];
          const code = sub.slice(len).trim();

          args.push(new CommandArg(code, ArgFormat.CODE_BLOCK, lang));
        } else {
          args.push(new CommandArg(sub.trim(), ArgFormat.CODE_BLOCK));
        }
      } else if (
        s.startsWith('`') &&
        !s.startsWith('``') &&
        (a = s.indexOf('`', 1)) > 0
      ) {
        const sub = s.slice(1, a);
        s = s.slice(a + 1);

        args.push(new CommandArg(sub, ArgFormat.INLINE_CODE));
      } else {
        const sub = s.split(/\s/)[0].trim();
        s = s.slice(sub.length);

        args.push(new CommandArg(sub, ArgFormat.UNQUOTED_STRING));
      }

      s = s.trim();
    }

    return args;
  }

  /**
   * Return the nth argument
   *
   * @param n The zero-indexed argument number
   * @returns The argument (if one exists)
   */
  nth(n: number) {
    return this.args[n];
  }

  /**
   * Returns the next argment and increments the counter
   *
   * @returns The next argument
   */
  next() {
    const next = this.args[this.index];
    if (next) {
      this.index++;
      return next;
    }

    return null;
  }

  /**
   * Returns the previous argument
   *
   * @returns The previous argument
   */
  prev() {
    return this.args[this.index - 1];
  }

  /**
   * Returns the next argument without incrementing
   * the counter
   *
   * @returns The next argument
   */
  peek() {
    return this.args[this.index];
  }

  /**
   * Returns the rest of the args and sets the index to the end
   *
   * @returns The remaining arguments
   */
  rest() {
    return this.args.slice(this.index);
  }

  /**
   * Modify the index counter
   */
  setIndex(n: number) {
    this.index = n;
    return this;
  }

  /**
   * The total number of arguments after parsing
   */
  get size() {
    return this.args.length;
  }

  /**
   * Return the raw, unparsed args
   */
  toString(): string {
    return this.raw;
  }
}

// TODO: what happened to the types here?
export class CommandArg<T = string | number | boolean, KIND = ArgFormat> {
  lang?: KIND extends ArgFormat.CODE_BLOCK ? string : never;
  name?: string;
  kind?: ArgKind;

  constructor(
    public val: T,
    public format: KIND,
    lang?: CommandArg<T, KIND>['lang']
  ) {
    if (lang) {
      this.lang = lang;
    }
  }

  /**
   * Get the inner value
   */
  valueOf(): T {
    return this.val;
  }
}

export class KWArgs extends Args {
  richArgs: CommandArg[] = [];

  constructor(raw: string, schema: ArgOptions[]) {
    super(raw);

    const kwargs = this.args.map((a, i) => {
      const s = schema[i];

      if (s) {
        const arg = schema[i] ? {...a, name: schema[i].name} : a;

        if (s.kind) {
          // TODO: implement the rest of the types

          arg.kind = s.kind;
          switch (s.kind) {
            case ArgKind.UINT: {
              const num = parseInt(arg.val as string);
              if (num < 0 || isNaN(num)) {
                throw new TypeError(
                  `Invalid type. Type ${num} is not assignable to type UINT`
                );
              }

              arg.val = num;

              break;
            }

            case ArgKind.INT: {
              const num = parseInt(arg.val as string);
              if (isNaN(num)) {
                throw new TypeError(
                  `Invalid type. Type ${arg.val} is not assignable to type INT`
                );
              }

              arg.val = num;
              break;
            }

            case ArgKind.FLOAT: {
              const num = parseFloat(arg.val as string);
              if (isNaN(num)) {
                throw new TypeError(
                  `Invalid type. Type ${arg.val} is not assignable to type FLOAT`
                );
              }

              arg.val = num;

              break;
            }

            case ArgKind.BOOLEAN: {
              try {
                arg.val = parseBoolean(arg.val);
              } catch {
                throw new TypeError(
                  `Invalid type. Type ${arg.val} is not assignable to type BOOLEAN`
                );
              }

              break;
            }

            case ArgKind.CODE: {
              if (
                arg.format !== ArgFormat.CODE_BLOCK &&
                arg.format !== ArgFormat.INLINE_CODE
              ) {
                throw new TypeError(
                  'Invalid type. Type STRING is not assignable to type CODE'
                );
              }
            }
          }
        } else {
          arg.kind = ArgKind.ANY;
        }

        if (s.transform) {
          // TODO: wat
          arg.val = s.transform(arg as CommandArg) as CommandArg['val'];
        }

        if (s.validate) {
          const valid = s.validate.label(s.name).validate(arg.val);
          if (valid.error) {
            throw new Error(valid.error.message);
          }
        }

        return arg;
      } else {
        return a;
      }
    });

    // TODO: why is this complaining
    this.richArgs = kwargs as CommandArg[];
  }

  get<T extends string | number | boolean>(
    name: string
  ): CommandArg<T> | undefined {
    return this.richArgs.find(a => a.name === name) as
      | CommandArg<T>
      | undefined;
  }
}

declare module 'discord.js' {
  export interface Message {
    /**
     * Parsed command arguments
     */
    args?: Args;

    /**
     * Named args
     */
    kwargs?: KWArgs;

    /**
     * The command
     */
    cmd?: Command;
  }
}

export * from './validation';
