import { setUser, readConfig } from "./config";
import os from "os";

function main() {
  setUser("Pete");
  const config = readConfig();
  for (const [key, value] of Object.entries(config)) {
    console.log(`${key}: ${value}`);
  }
}

main();