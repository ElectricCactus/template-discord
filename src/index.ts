import { Client, GatewayIntentBits } from "discord.js";
import { registerCleanupFn } from "./cleanup";
import {
  ChatCommand,
  handleAutocomplete,
  handleChat,
  handleMessage,
} from "./command";
import { PingCommand } from "./commands/ping";
import { registerCommands } from "./register";

export async function main() {
  const commands: ChatCommand[] = [PingCommand];

  await registerCommands(commands);

  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  client.once("ready", () => {
    console.log("✅ Ready!");
  });

  client.on("interactionCreate", async (interaction) => {
    if (interaction.isChatInputCommand())
      await handleChat(client, commands, interaction);
    else if (interaction.isAutocomplete())
      await handleAutocomplete(client, commands, interaction);
  });

  client.on("messageCreate", async (message) => {
    await handleMessage(client, commands, message);
  });

  const { DISCORD_TOKEN } = process.env;

  client.login(DISCORD_TOKEN);

  registerCleanupFn(() => client.destroy());
}

if (require.main === module) {
  main();
}
