import { Client, GatewayIntentBits } from "discord.js";
import { DiscordChatCommand, handleInteraction } from "./command";
import { TestCommand } from "./commands/test";
import { registerCommands } from "./register";

export async function startBot() {
  const { DISCORD_TOKEN } = process.env;

  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  const commands: DiscordChatCommand[] = [TestCommand];

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
