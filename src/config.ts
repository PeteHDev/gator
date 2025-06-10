import fs from "fs";
import os from "os";
import path from "path";

type Config = {
    dbUrl: string;
    currentUserName: string;
};

export function setUser(userName: string) {
    const config: Config = {
        dbUrl: "postgres://example",
        currentUserName: userName,
    };

    fs.writeFileSync(getConfigFilePath(), JSON.stringify(config));
}

export function readConfig(): Config {
    const config: Config = JSON.parse(fs.readFileSync(getConfigFilePath(), 'utf8'));
    return config;
}

function getConfigFilePath(): string {
    return path.join(os.homedir(), ".gatorconfig.json");
}