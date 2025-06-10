import { error } from "console";
import { handlerLogin } from "./command_handler";
import { CommandsRegistry, registerCommand, runCommand } from "./commands_registry";
import { setUser, readConfig } from "./config";
import os from "os";

function main() {
    if (process.argv.length < 3) {
        console.error("No arguments provided.");
        process.exit(1);
    }
    
    const cmdRegistry: CommandsRegistry = {};
    registerCommand(cmdRegistry, "login", handlerLogin);
    

    const cmdName = process.argv[2];
    const commandArguments = process.argv.slice(3);
    try {
        runCommand(cmdRegistry, cmdName, ...commandArguments);
    } catch(err) {
        if (err instanceof Error) {
            console.error(`Error running command: ${err.message}.`);
        } else {
            console.error(`Unexpected exception caught when trying to run command: ${err}`);
        }
        process.exit(1);
    }
}

main();