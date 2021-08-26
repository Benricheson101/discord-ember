import {FluentBundle} from '@fluent/bundle';
import {Registry} from '.';

export class LanguageRegistry extends Registry<string, FluentBundle> {
  constructor() {
    super();
  }
}
