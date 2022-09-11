import { inspect } from "util";

import { Routes } from "discord.js";
import { REST } from "@discordjs/rest";

import { DiscordChatCommand } from "./command";

export async function registerCommands(
  commands: DiscordChatCommand[],
  log = console.log
): Promise<void> {
  const { DISCORD_TOKEN, DISCORD_CLIENT_ID } = process.env;
  const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN!);

  const userGuilds = (await rest.get(Routes.userGuilds())) as {
    id: string;
  }[];

  log(
    `🥞 Registering ${commands.length} command(s) to ${userGuilds.length} guild(s)`
  );

  for (const { id } of userGuilds) {
    try {
      await rest.put(Routes.applicationGuildCommands(DISCORD_CLIENT_ID!, id), {
        body: commands.map((command) => command.option),
      });
    } catch (error) {
      log("⚠️", inspect(error));
    }
  }
}
