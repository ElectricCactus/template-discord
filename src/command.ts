import { inspect } from "util";

import {
  ChatInputCommandInteraction,
  Client,
  SlashCommandBuilder,
} from "discord.js";

export type DiscordApplicationCommandOption = ReturnType<
  SlashCommandBuilder["toJSON"]
>;

export type DiscordChatCommandContext<T = DiscordChatCommand> = {
  command: T;
  client: Client;
};

export interface DiscordChatCommand {
  option: DiscordApplicationCommandOption;
  handler: (
    interaction: ChatInputCommandInteraction,
    context: DiscordChatCommandContext<this>
  ) => Promise<void> | void;
}

export async function handleInteraction(
  client: Client,
  commands: DiscordChatCommand[],
  interaction: ChatInputCommandInteraction,
  log = console.log
) {
  const command = commands.find(
    (command) => command.option.name === interaction.commandName
  );
  if (!command) return;
  try {
    await command.handler(interaction, { command, client });
  } catch (err) {
    log(inspect(err));
    const message = "Failed to handle interaction";
    if (interaction.replied) await interaction.editReply(message);
    else await interaction.reply(message);
  }
}
