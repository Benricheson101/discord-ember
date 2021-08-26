/**
 * Create a class decorator that adds a `Set` property, `key`
 * to a class and appends he provided item
 */
export function createSetDecorator<T>(key: string) {
  return (prop: T): ClassDecorator => {
    return (f: Function) => {
      if (f.prototype[key]) {
        f.prototype[key].add(prop);
      } else {
        f.prototype[key] = new Set<T>().add(prop);
      }
    };
  };
}

/**
 * Attempt to convert types into a boolean
 *
 * @returns The converted boolean
 * @throws {TypeError} Thrown if the type cannot be parsed
 */
export function parseBoolean(
  v: string | number | boolean | null | undefined
): boolean {
  const yesVals = ['y', 'yes', 't', 'true'];
  const noVals = ['n', 'no', 'f', 'false'];

  switch (typeof v) {
    case 'string': {
      const s = v.toLowerCase().trim();

      if (yesVals.includes(s)) {
        return true;
      }

      if (noVals.includes(s)) {
        return false;
      }

      break;
    }

    case 'boolean': {
      return v;
    }

    case 'number': {
      if (v === 1) {
        return true;
      }

      if (v === 0) {
        return false;
      }

      break;
    }

    case 'undefined': {
      return false;
    }
  }

  if (v === null) {
    return false;
  }

  throw new TypeError(`Type ${v} cannot be converted to a boolean`);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Type representing dot notation for accessing an object's property
 * as a string
 *
 * @example
 * const myObject = {
 *   nested: {
 *     object: 'hello',
 *   },
 * };
 *
 * const dotNotation: DotNotation<typeof myObject> = 'nested.object';
 */
export type DotNotation<
  T extends Record<string, any>,
  Sep extends string = '.',
  K extends keyof T = keyof T
> = K extends string
  ? T[K] extends any[]
    ? K
    : T[K] extends Record<string, any>
    ? `${K}${Sep}${DotNotation<T[K]>}` | K
    : K
  : never;

/**
 * Useful in combination with {@link DotNotation}, this type
 * is used to get the type of the value a dot-notation string
 * is referencing
 *
 * @example
 * const myObject = {
 *   nested: {
 *     object: 'hello',
 *   },
 * };
 *
 * type TypeOfObjectKey = DotToObjectType<typeof myObject, 'nested.object'>;
 *
 * TypeOfObjectKey === `string`;
 */
export type DotToPropType<
  T extends Record<string, any>,
  Dot extends DotNotation<T, Sep>,
  Sep extends string = '.'
> = Dot extends `${infer First}${Sep}${infer Rest}`
  ? DotToPropType<
      T[First],
      Rest extends DotNotation<T[First]> ? Rest : never,
      Sep
    >
  : Dot extends `${infer First}`
  ? T[First]
  : T;
/* eslint-enable */
