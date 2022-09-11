import { SlashCommandBuilder } from "discord.js";
import { DiscordChatCommand, handleInteraction } from "./command";

describe("handleInteraction", () => {
  it("should handle interaction", async () => {
    const Command: DiscordChatCommand = {
      option: new SlashCommandBuilder()
        .setName("name")
        .setDescription("description")
        .toJSON(),
      handler: jest.fn(),
    };
    await expect(
      handleInteraction({} as any, [Command], {
        commandName: "name",
      } as any)
    ).resolves.toBeUndefined();
    expect(Command.handler).toHaveBeenCalledTimes(1);
  });
  it("should handle no interactions", async () => {
    const Command: DiscordChatCommand = {
      option: new SlashCommandBuilder()
        .setName("name")
        .setDescription("description")
        .toJSON(),
      handler: jest.fn(),
    };
    await expect(
      handleInteraction({} as any, [Command], {} as any)
    ).resolves.toBeUndefined();
    expect(Command.handler).toHaveBeenCalledTimes(0);
  });
});
