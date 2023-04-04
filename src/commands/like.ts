import { ApplicationCommandType, ContextMenuCommandBuilder } from "discord.js";
import { MenuCommand } from "../command";

export const LikeCommand: MenuCommand = {
  type: "menu",
  option: new ContextMenuCommandBuilder()
    .setName("like")
    .setType(ApplicationCommandType.Message),
  menu: async (interaction) => {
    await interaction.deferReply({
      ephemeral: true,
    });
    if (interaction.isMessageContextMenuCommand()) {
      await interaction.targetMessage.react("👍");
      await interaction.followUp("Message Liked!");
    } else {
      await interaction.followUp("This is not a message context menu command");
    }
  },
};
