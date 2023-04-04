import { inspect } from "util";

import { Routes } from "discord.js";
import { REST } from "@discordjs/rest";

import { ChatCommand } from "./command";

export function validateCommands(commands: ChatCommand[]): void {
  const names = commands.map((command) => command.option.name);
  const duplicates = names.filter(
    (name, index) => names.indexOf(name) !== index
  );
  if (duplicates.length > 0) {
    throw new Error(
      `Duplicate commands: ${inspect(duplicates, { depth: Infinity })}`
    );
  }
}

export async function unregisterCommands(log = console.log): Promise<void> {
  const { DISCORD_TOKEN, DISCORD_CLIENT_ID } = process.env;

  if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
    throw new Error("Missing DISCORD_TOKEN or DISCORD_CLIENT_ID");
  }

  const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);

  const userGuilds = (await rest.get(Routes.userGuilds())) as {
    id: string;
  }[];

  log(`🥞 Unregistering all commands in ${userGuilds.length} guild(s)`);

  for (const { id } of userGuilds) {
    try {
      await rest.put(Routes.applicationGuildCommands(DISCORD_CLIENT_ID, id), {
        body: [],
      });
    } catch (error) {
      log("⚠️", inspect(error));
    }
  }
}

export async function registerCommands(
  commands: ChatCommand[],
  log = console.log
): Promise<void> {
  const { DISCORD_TOKEN, DISCORD_CLIENT_ID } = process.env;

  if (!DISCORD_TOKEN || !DISCORD_CLIENT_ID) {
    throw new Error("Missing DISCORD_TOKEN or DISCORD_CLIENT_ID");
  }

  validateCommands(commands);

  const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);

  const userGuilds = (await rest.get(Routes.userGuilds())) as {
    id: string;
  }[];

  log(
    `🥞 Registering ${commands.length} command(s) to ${userGuilds.length} guild(s)`
  );

  for (const { id } of userGuilds) {
    try {
      await rest.put(Routes.applicationGuildCommands(DISCORD_CLIENT_ID, id), {
        body: commands.map((command) => command.option),
      });
    } catch (error) {
      log("⚠️", inspect(error));
    }
  }
}
