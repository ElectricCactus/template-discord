import { Client, Events, GatewayIntentBits } from "discord.js";
import { registerCleanupFn } from "./cleanup";
import { Command, handleInteraction, handleMessage } from "./command";
import { PingCommand } from "./commands/ping";
import { registerCommands } from "./register";
import { LikeCommand } from "./commands/like";

export async function main() {
  const commands: Command[] = [LikeCommand, PingCommand];

  await registerCommands(commands);

  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  client.once(Events.ClientReady, () => {
    console.log("✅ Ready!");
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    await handleInteraction(client, commands, interaction);
  });

  client.on(Events.MessageCreate, async (message) => {
    await handleMessage(client, commands, message);
  });

  const { DISCORD_TOKEN } = process.env;

  client.login(DISCORD_TOKEN);

  registerCleanupFn(() => client.destroy());
}

if (require.main === module) {
  main();
}
