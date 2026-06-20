import {Command, Option} from "commander";
import readline from "node:readline/promises";
import {stdin as input, stdout as output} from "node:process";
import fs from "node:fs";
import * as nodemailer from "nodemailer";
import os from "node:os";
import path from "node:path";


function main() {
  const program = new Command();

  program
    .name("Email cli")
    .description("CLI to send emails")
    .version("1.0.0");

  program.command("send")
    .description("Send an email")
    .option("-s, --subject <str>", "Subject of email")
    .option("-m, --message <str>", "Message of email. Can be HTML")
    .option("-r, --recipients <str>", "A space separated string of email recipients")
    .option("-f, --from <str>", "Optional send from name")
    .action(function (options) {
      if (!options["subject"] || !options["message"] || !options["recipients"] || !options["from"]) {
        console.log("Must include subject, message, recipients and from. Use --help for more info");
        return;
      }
    });

  program.command("config")
    .description("Update email config values")
    .addOption(
      new Option("-g, --google-auth <type>", "specify which google auth flow to use")
        .choices(["oauth", "app-password"])
        .default("app-password")
    )
    .option("-v, --view-config", "view the config values")
    .action(async function (options) {
      await handleConfig(options);
    });

  program.parse();
}

main();

async function handleConfig(options: Record<string, string>) {
  const configDir = ".email-cli";
  const homeDir = os.homedir();
  const dirPath = path.join(homeDir, configDir);
  const filePath = path.join(dirPath, "config.json");

  if (options.viewConfig) {
    if (!fs.existsSync(filePath)) {
      console.log("No configuration file exists yet. Create a new one with `email-cli` config");
      return;
    }
    const data = fs.readFileSync(filePath, {encoding: "utf-8"});
    const decodeJson = JSON.parse(data);
    for (const line in decodeJson) {
      console.log(`${line}: ${decodeJson[line]}`);
    }
    return;
  }
  if (options.googleAuth === "oauth") {
    console.log("Oauth not implemented yet");
    return;
  }

  const rl = readline.createInterface({input, output});

  try {
    const emailAddress = await rl.question("Enter email address: ");
    const port = await rl.question("Enter port: ");
    const appPassword = await rl.question("Enter app-password: ");

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, {recursive: true});
    }

    fs.writeFileSync(filePath,
      JSON.stringify({
          emailAddress,
          port,
          appPassword,
        },
        null,
        2,
      ));

    console.log("Saved configuration to ~/.email-cli");
  } catch (e: any) {
    if (e.name === "AbortError") {
      console.log("Exit");
      process.exit(0);
    } else {
      console.error("Unexpected error occurred:", e);
      process.exit(1);
    }
  } finally {
    rl.close();
  }
}