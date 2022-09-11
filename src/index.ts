import { Client, GatewayIntentBits } from "discord.js";
import { DiscordChatCommand, handleInteraction } from "./command";
import { PingCommand } from "./commands/ping";
import { registerCommands } from "./register";

export async function main() {
  const commands: DiscordChatCommand[] = [PingCommand];

  await registerCommands(commands);

  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  client.once("ready", () => {
    console.log("✅ Ready!");
  });

  client.on("interactionCreate", async (interaction) => {
    if (interaction.isChatInputCommand())
      await handleInteraction(client, commands, interaction);
  });

  const { DISCORD_TOKEN } = process.env;

  client.login(DISCORD_TOKEN);
}

if (require.main === module) {
  main();
}
