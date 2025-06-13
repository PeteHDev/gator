import { readConfig, setUser } from "./config";
import { createUser, deleteAllUsers, getUserByName, getUsers } from "./lib/db/queries/users";

export type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;

export async function handlerLogin(cmdName: string, ...args: string[]) {
    if (args.length === 0) {
        throw new Error("login command expects username as an argument");
    } else if (args.length > 1) {
        throw new Error("login command expects only 1 <username> argument");
    }

    const userName = args[0];
    if (await getUserByName(userName) === undefined) {
        throw new Error(`user ${userName} does not exist`);
    }

    setUser(args[0]);
    console.log(`user "${args[0]}" has been set`);
}

export async function handlerRegister(cmdName: string, ...args: string[]) {
    if (args.length === 0) {
        throw new Error("register command expects username as an argument");
    } else if (args.length > 1) {
        throw new Error("register command expects only 1 <username> argument");
    }

    const userName = args[0];

    if (await getUserByName(userName) !== undefined) {
        throw new Error(`user ${userName} already exists`);
    }

    const user = await createUser(userName);
    setUser(userName);
    console.log(`user ${userName} has been created`);
    console.log(user);
}

export async function handlerUsers() {
    const users = await getUsers();
    const currentUser = readConfig().currentUserName;
    for (const user of users) {
        let name = user.name;
        if (name === currentUser) {
            name += " (current)";
        }
        console.log(`* ${name}`);
    }
}

export async function handlerReset(cmdName: string, ...args: string[]) {
    await deleteAllUsers();
}
