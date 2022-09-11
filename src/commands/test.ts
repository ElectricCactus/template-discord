import { SlashCommandBuilder } from "discord.js";
import { DiscordChatCommand } from "../command";

export const TestCommand: DiscordChatCommand = {
  option: new SlashCommandBuilder()
    .setName("test")
    .setDescription("Test command")
    .toJSON(),
  handler: async (interaction) => {
    await interaction.reply("tested");
  },
};
