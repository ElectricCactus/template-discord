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
  interaction: ChatInputCommandInteraction
) {
  const command = commands.find(
    (command) => command.option.name === interaction.commandName
  );
  if (!command) return;
  await command.handler(interaction, { command, client });
}
