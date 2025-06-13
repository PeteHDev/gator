import fs, { write } from "fs";
import os from "os";
import path from "path";

type Config = {
    dbUrl: string;
    currentUserName: string;
};

export function setUser(userName: string) {
    const config: Config = readConfig();
    config.currentUserName = userName;
    writeConfig(config);
}

function validateConfig(rawConfig: any) {
  if (!rawConfig.dbUrl || typeof rawConfig.dbUrl !== "string") {
    throw new Error("db_url is required in config file");
  }
  if (
    !rawConfig.currentUserName ||
    typeof rawConfig.currentUserName !== "string"
  ) {
    throw new Error("currentUserName is required in config file");
  }

  const config: Config = {
    dbUrl: rawConfig.dbUrl,
    currentUserName: rawConfig.currentUserName,
  };

  return config;
}

export function readConfig(): Config {
    const config: Config = JSON.parse(fs.readFileSync(getConfigFilePath(), 'utf8'));
    return validateConfig(config);
}

function getConfigFilePath(): string {
    return path.join(os.homedir(), ".gatorconfig.json");
}

function writeConfig(config: Config) {
  const fullPath = getConfigFilePath();

  const rawConfig = {
    dbUrl: config.dbUrl,
    currentUserName: config.currentUserName,
  };

  const data = JSON.stringify(rawConfig, null, 2);
  fs.writeFileSync(fullPath, data, { encoding: "utf-8" });
}