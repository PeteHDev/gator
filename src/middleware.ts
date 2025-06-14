import type { CommandHandler, UserCommandHandler } from "./command_handler";
import { readConfig } from "./config";
import { getUserByName } from "./lib/db/queries/users";

export function middlewareLoggedIn(
  handler: UserCommandHandler,
): CommandHandler {
  return async (cmdName: string, ...args: string[]): Promise<void> => {
    const config = readConfig();
    const userName = config.currentUserName;
    if (!userName) {
      throw new Error("User not logged in");
    }

    const user = await getUserByName(userName);
    if (!user) {
      throw new Error(`User ${userName} not found`);
    }

    await handler(cmdName, user, ...args);
  };
}
