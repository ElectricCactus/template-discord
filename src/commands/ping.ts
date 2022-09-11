import { SlashCommandBuilder } from "discord.js";
import { DiscordChatCommand } from "../command";

export const PingCommand: DiscordChatCommand = {
  option: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Ping command")
    .toJSON(),
  handler: async (interaction) => {
    await interaction.reply("pong");
  },
};
