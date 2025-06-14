import { error } from "console";
import { handlerAddfeed, handlerAgg, handlerFeeds, handlerLogin, handlerRegister, handlerReset, handlerUsers } from "./command_handler";
import { CommandsRegistry, registerCommand, runCommand } from "./commands_registry";
import { setUser, readConfig } from "./config";
import os from "os";

async function main() {
    if (process.argv.length < 3) {
        console.error("usage: cli <command> [args...]");
        process.exit(1);
    }
    
    const cmdRegistry: CommandsRegistry = {};
    registerCommand(cmdRegistry, "login", handlerLogin);
    registerCommand(cmdRegistry, "register", handlerRegister);
    registerCommand(cmdRegistry, "users", handlerUsers);
    registerCommand(cmdRegistry, "reset", handlerReset);
    registerCommand(cmdRegistry, "agg", handlerAgg);
    registerCommand(cmdRegistry, "addfeed", handlerAddfeed);
    registerCommand(cmdRegistry, "feeds", handlerFeeds);
    

    const cmdName = process.argv[2];
    const commandArguments = process.argv.slice(3);
    let exitCode = 0;
    try {
        await runCommand(cmdRegistry, cmdName, ...commandArguments);
    } catch(err) {
        if (err instanceof Error) {
            console.error(`Error running ${cmdName} command: ${err.message}.`);
        } else {
            console.error(`Unexpected exception caught trying to run ${cmdName} command: ${err}`);
        }
        exitCode = 1;
    } finally {
        process.exit(exitCode);
    }
}

await main();