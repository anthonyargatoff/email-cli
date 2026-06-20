import os from "node:os";
import path from "node:path";
import type { GoogleAppPasswordConfig } from "./types.js";
import fs from "node:fs";

export class Config {
  static configDir = ".email-cli";
  static homeDir = os.homedir();
  static dirPath = path.join(this.homeDir, this.configDir);
  static filePath = path.join(this.dirPath, "config.json");

  static getConfig(): GoogleAppPasswordConfig | null {
    if (!fs.existsSync(this.filePath)) {
      console.log("No configuration file exists yet. Create a new one with `email-cli` config");
      return null;
    }
    const data = fs.readFileSync(this.filePath, {encoding: "utf-8"});
    return JSON.parse(data);
  }

  static updateConfig(config: GoogleAppPasswordConfig) {
    if (!fs.existsSync(this.dirPath)) {
      fs.mkdirSync(this.filePath, {recursive: true});
    }

    fs.writeFileSync(this.filePath,
      JSON.stringify({
          emailAddress: config.emailAddress,
          appPassword: config.appPassword,
        },
        null,
        2,
      ));

    console.log("Saved configuration to ~/.email-cli");
  }
}
