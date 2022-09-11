import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export type DiscordAPIApplicationCommandOption = ReturnType<
  SlashCommandBuilder["toJSON"]
>;

export interface DiscordChatCommand {
  option: DiscordAPIApplicationCommandOption;
  handler: (
    interaction: ChatInputCommandInteraction,
    command: this
  ) => Promise<void> | void;
}

export async function handleInteraction(
  commands: DiscordChatCommand[],
  interaction: ChatInputCommandInteraction
) {
  const command = commands.find(
    (command) => command.option.name === interaction.commandName
  );
  if (!command) return;
  await command.handler(interaction, command);
}
