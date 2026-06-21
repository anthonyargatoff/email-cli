import { Command, Option } from "commander";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import * as nodemailer from "nodemailer";
import type { GoogleAppPasswordConfig } from "./types.js";
import { Config } from "./config.js";

function main() {
  const program = new Command();

  program
    .name("Email cli")
    .description("CLI to send emails")
    .version("1.0.0");

  program.command("send")
    .description("Send an email")
    .requiredOption("-s, --subject <str>", "Subject of email")
    .requiredOption("-m, --message <str>", "Message of email. Can be HTML")
    .requiredOption("-r, --recipients <str>", "A space separated string of email recipients")
    .option("-f, --from <str>", "Optional send from name")
    .action(async function (options) {
      const config = Config.getConfig();
      if (!config) return;

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: config.emailAddress,
          pass: config.appPassword,
        }
      });

      try {
        const info = await transporter.sendMail({
          from: options.from ? `"${options.from}" <${config.emailAddress}>` : config.emailAddress,
          bcc: options.recipients.replaceAll(" ", ", "),
          subject: options.subject,
          html: options.message,
        });
        console.log("Message sent: ", info.messageId);
      } catch (e) {
        console.error("Error while sending mail:", e);
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
  if (options.viewConfig) {
    const configData = Config.getConfig();
    if (!configData) return;
    for (const line in configData) {
      console.log(`${line}: ${configData[line as keyof GoogleAppPasswordConfig]}`);
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
    const appPassword = await rl.question("Enter app-password: ");

    Config.updateConfig({emailAddress, appPassword});
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