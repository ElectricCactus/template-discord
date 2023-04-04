import { SlashCommandBuilder } from "discord.js";
import { ChatCommand, handleChat, resolveCommand } from "./command";

const mockLog = jest.fn();

type InteractionOptions = {
  commandName: string;
  replied: boolean;
  isAutocomplete: boolean;
  isChatInputCommand: boolean;
};
function mockedInteraction({
  commandName = "name",
  replied = false,
  isAutocomplete = false,
  isChatInputCommand = true,
}: Partial<InteractionOptions> = {}) {
  return {
    commandName,
    replied,
    isChatInputCommand: jest.fn().mockReturnValue(isChatInputCommand),
    isAutocomplete: jest.fn().mockReturnValue(isAutocomplete),
    reply: jest.fn().mockResolvedValue(undefined),
    followUp: jest.fn().mockResolvedValue(undefined),
  };
}

beforeEach(() => {
  mockLog.mockClear();
});

describe("resolveCommand", () => {
  it("should resolve a command", () => {
    const Command: ChatCommand = {
      option: new SlashCommandBuilder()
        .setName("name")
        .setDescription("description")
        .toJSON(),
      handler: jest.fn(),
    };
    expect(resolveCommand([Command], "name")).toBe(Command);
  });
});

describe("handleInteraction", () => {
  it("should handle interaction", async () => {
    const Command: ChatCommand = {
      option: new SlashCommandBuilder()
        .setName("name")
        .setDescription("description")
        .toJSON(),
      handler: jest.fn().mockResolvedValue(undefined),
      chat: jest.fn().mockResolvedValue(undefined),
    };
    const mockInteraction: any = mockedInteraction();
    const mockClient: any = {};
    await expect(
      handleChat(mockClient, [Command], mockInteraction)
    ).resolves.toBeUndefined();
    expect(Command.chat).toHaveBeenCalledTimes(1);
    expect(Command.chat).toHaveBeenCalledWith(mockInteraction, {
      command: Command,
      client: mockClient,
    });
  });
  it("should handle no interactions", async () => {
    const Command: ChatCommand = {
      option: new SlashCommandBuilder()
        .setName("name")
        .setDescription("description")
        .toJSON(),
      handler: jest.fn(),
    };
    await expect(
      handleChat(
        {} as any,
        [Command],
        mockedInteraction({ commandName: "bogus" }) as any
      )
    ).resolves.toBeUndefined();
    expect(Command.handler).toHaveBeenCalledTimes(0);
  });
  it("should gracefully handle errors", async () => {
    const Command: ChatCommand = {
      option: new SlashCommandBuilder()
        .setName("name")
        .setDescription("description")
        .toJSON(),
      handler: jest.fn().mockResolvedValue(undefined),
      chat: jest.fn().mockRejectedValue(new Error("error")),
    };
    const mockInteraction: any = mockedInteraction();
    await expect(
      handleChat({} as any, [Command], mockInteraction, mockLog)
    ).resolves.toBeUndefined();
    expect(Command.chat).toHaveBeenCalledTimes(1);
    expect(mockInteraction.reply).toHaveBeenCalledTimes(1);
  });
  it("should gracefully handle errors when the interaction has already been replied to", async () => {
    const Command: ChatCommand = {
      option: new SlashCommandBuilder()
        .setName("name")
        .setDescription("description")
        .toJSON(),
      handler: jest.fn().mockRejectedValue(new Error("error")),
      chat: jest.fn().mockRejectedValue(new Error("error")),
    };
    const mockInteraction: any = mockedInteraction({ replied: true });
    await expect(
      handleChat({} as any, [Command], mockInteraction, mockLog)
    ).resolves.toBeUndefined();
    expect(Command.chat).toHaveBeenCalledTimes(1);
    expect(mockInteraction.followUp).toHaveBeenCalledTimes(1);
  });
});
