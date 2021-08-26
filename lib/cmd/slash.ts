import {ApplicationCommandOption} from 'discord.js';

export function SlashCommand(
  ops: Omit<ApplicationCommandOption, 'options' | 'required' | 'type'>
): ClassDecorator {
  return ({prototype: p}: Function) => {
    p.slash = ops;
  };
}
