import { SlashCommandBuilder } from "discord.js";
import { DiscordChatCommand, handleInteraction } from "./command";

const mockLog = jest.fn();

beforeEach(() => {
  mockLog.mockClear();
});

describe("handleInteraction", () => {
  it("should handle interaction", async () => {
    const Command: DiscordChatCommand = {
      option: new SlashCommandBuilder()
        .setName("name")
        .setDescription("description")
        .toJSON(),
      handler: jest.fn().mockResolvedValue(undefined),
    };
    const mockInteraction: any = {
      commandName: "name",
    };
    const mockClient: any = {};
    await expect(
      handleInteraction(mockClient, [Command], mockInteraction)
    ).resolves.toBeUndefined();
    expect(Command.handler).toHaveBeenCalledTimes(1);
    expect(Command.handler).toHaveBeenCalledWith(mockInteraction, {
      command: Command,
      client: mockClient,
    });
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
  it("should gracefully handle errors", async () => {
    const Command: DiscordChatCommand = {
      option: new SlashCommandBuilder()
        .setName("name")
        .setDescription("description")
        .toJSON(),
      handler: jest.fn().mockRejectedValue(new Error("error")),
    };
    const mockInteraction: any = {
      commandName: "name",
      replied: false,
      reply: jest.fn().mockResolvedValue(undefined),
    };
    await expect(
      handleInteraction({} as any, [Command], mockInteraction, mockLog)
    ).resolves.toBeUndefined();
    expect(Command.handler).toHaveBeenCalledTimes(1);
    expect(mockInteraction.reply).toHaveBeenCalledTimes(1);
    expect(mockLog).toHaveBeenCalledTimes(1);
  });
  it("should gracefully handle errors when the interaction has already been replied to", async () => {
    const Command: DiscordChatCommand = {
      option: new SlashCommandBuilder()
        .setName("name")
        .setDescription("description")
        .toJSON(),
      handler: jest.fn().mockRejectedValue(new Error("error")),
    };
    const mockInteraction: any = {
      commandName: "name",
      replied: true,
      editReply: jest.fn().mockResolvedValue(undefined),
    };
    await expect(
      handleInteraction({} as any, [Command], mockInteraction, mockLog)
    ).resolves.toBeUndefined();
    expect(Command.handler).toHaveBeenCalledTimes(1);
    expect(mockInteraction.editReply).toHaveBeenCalledTimes(1);
    expect(mockLog).toHaveBeenCalledTimes(1);
  });
});
