import {Guard, _Guard} from '.';

class DisabledCommand extends _Guard {
  async check(): Promise<boolean> {
    return false;
  }
}

/**
 * This guard always returns false. It is an effective way of
 * disabling a command/disallowing all users from using it.
 */
export const Disabled = Guard(DisabledCommand);
