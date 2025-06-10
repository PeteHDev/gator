import { setUser } from "./config";

export type CommandHandler = (cmdName: string, ...args: string[]) => void;

export function handlerLogin(cmdName: string, ...args: string[]) {
    if (args.length === 0) {
        throw new Error("login command expects username as an argument");
    } else if (args.length > 1) {
        throw new Error("login command expects only 1 [username] argument");
    }

    setUser(args[0]);
    console.log(`user "${args[0]}" has been set`);
}