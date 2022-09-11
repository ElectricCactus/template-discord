import { Client, GatewayIntentBits } from "discord.js";
import { DiscordChatCommand, handleInteraction } from "./command";
import { PingCommand } from "./commands/ping";
import { registerCommands } from "./register";

export async function startBot() {
  const { DISCORD_TOKEN } = process.env;

  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  const commands: DiscordChatCommand[] = [PingCommand];

  await registerCommands(commands);

  client.once("ready", () => {
    console.log("✅ Ready!");
  });

  client.on("interactionCreate", async (interaction) => {
    if (interaction.isChatInputCommand())
      await handleInteraction(commands, interaction);
  });

  client.login(DISCORD_TOKEN);
}
