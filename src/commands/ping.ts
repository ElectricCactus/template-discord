import { SlashCommandBuilder } from "discord.js";
import { ChatCommand } from "../command";

export const PingCommand: ChatCommand = {
  option: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Ping command")
    .toJSON(),
  handler: async () => {
    return "pong";
  },
};
