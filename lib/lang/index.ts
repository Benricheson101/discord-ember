import {FluentBundle, FluentResource} from '@fluent/bundle';
import {LanguageRegistry} from '../registry/lang';
import {Dirent, readdirSync, readFileSync} from 'fs';
import path from 'path';

export interface LanguageClientOptions {
  langDir: string;
  common?: string;
  fallback?: string;
}

/** The Localization client used in the bot */
export class LanguageClient {
  registry = new LanguageRegistry();
  langDir: string;
  fallback?: string;
  common?: FluentResource;
  ignoreFiles = ['common.ftl'];

  constructor(ops: LanguageClientOptions) {
    this.langDir = ops.langDir;
    this.fallback = ops.fallback;

    if (ops.common) {
      this.loadCommon(ops.common);
    }
  }

  /**
   * Load a Fluent string for a certain language
   *
   * @param lang The language identifier/bundle name
   * @param source THe Fluent string
   * @param allowOverrides Allow Fluent to overwrite an existing key
   */
  load(lang: string, source: string, allowOverrides = false): this {
    const resource = new FluentResource(source);
    const bundle =
      this.registry.get(lang) || new FluentBundle(lang, {useIsolating: false});
    const errors = bundle.addResource(resource, {allowOverrides});

    if (errors.length) {
      throw errors;
    }

    if (this.common) {
      const commonErrors = bundle.addResource(this.common, {
        allowOverrides: true,
      });

      if (commonErrors.length) {
        throw commonErrors;
      }
    }

    this.registry.register(lang, bundle);

    return this;
  }

  /**
   * Recursively load all language files
   *
   * The top-level dir will be used as the bundle name
   *
   * @param parent The top level dir containing the localization files
   */
  loadAll(parent: string = this.langDir) {
    const readDir = (dir: string): Dirent[] =>
      readdirSync(dir, {withFileTypes: true}).filter(
        f => !this.ignoreFiles.some(a => f.name.endsWith(a))
      );

    const walk = (top: string, dir: string): void => {
      const c = readDir(dir);

      for (const item of c) {
        if (item.isFile()) {
          this.loadFile(top, path.join(dir, item.name));
        } else if (item.isDirectory()) {
          return walk(top, path.join(dir, item.name));
        }
      }
    };

    for (const dir of readDir(parent).filter(f => f.isDirectory())) {
      walk(dir.name, path.join(parent, dir.name));
    }
  }

  /**
   * Load a single file
   *
   * @param lang The language identifier
   * @param path The file to load
   */
  loadFile(lang: string, path: string) {
    const file = readFileSync(path, 'utf8');

    return this.load(lang, file);
  }

  loadCommon(path: string) {
    const file = readFileSync(path, 'utf8');
    this.common = new FluentResource(file);
  }

  /**
   * Get a translated string for a specified language, using the `fallback` language if needed.
   *
   * @param lang The language identifier
   * @param msg The localization key
   * @param [args] Args to fill string placeholders
   * @param [errors] Any errors that occurred while processing will be pushed to this array
   * @returns The translated string
   */
  get(
    lang: string,
    msg: string,
    args: {[key: string]: string},
    errors: Error[] = []
  ): string {
    const bundle = this.registry.get(lang as string);

    if (bundle) {
      const message = bundle.getMessage(msg as string);

      if (message?.value) {
        return bundle.formatPattern(message.value, args, errors);
      } else if (this.fallback) {
        const bundle = this.registry.get(this.fallback)!;
        const message = bundle.getMessage(msg as string);

        if (message?.value) {
          return bundle.formatPattern(message.value, args, errors);
        }
      }
    }

    return msg;
  }
}
