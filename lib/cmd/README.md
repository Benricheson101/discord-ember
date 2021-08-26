Design ideas:

```ts
// run the ServerModerator check function prior to commmand execution
@Guard(ServerModerator)
// Argument validation
@Arg<string>('first__name', {type: ArgKind.STRING, required: true, like: /^regex: .*/}) // first arg must be a string matching regex
@Arg<number>('second_arg', [{type: ArgKind.INT}, {type: ArgKind.FLOAT}]) // second arg must be either an int or float
class MyCommand extends Command {
  /**
   * Use doc strigs for command descriptions, supporting full markdown
   */

  async text(msg: Message) {
    // msg.args.nth(n) => nth arg
    // msg.args.raw => array of strings split by whitespace
  }
}
```

Other ideas:
- support both text commands and interactions
