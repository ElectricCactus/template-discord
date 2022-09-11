import { SlashCommandBuilder } from "discord.js";
import { DiscordChatCommand } from "./command";
import { registerCommands, validateCommands } from "./register";

const SampleCommand: DiscordChatCommand = {
  option: new SlashCommandBuilder()
    .setName("sample")
    .setDescription("Sample Command")
    .toJSON(),
  handler: jest.fn().mockRejectedValue(undefined),
};

const getMock = jest.fn();
const putMock = jest.fn();

jest.mock("@discordjs/rest", () => ({
  REST: jest.fn().mockImplementation(() => ({
    setToken: jest.fn().mockReturnThis(),
    get: getMock,
    put: putMock,
  })),
}));

const logNoop = jest.fn();

beforeEach(() => {
  process.env = {
    ...process.env,
    DISCORD_TOKEN: "token",
    DISCORD_CLIENT_ID: "client_id",
  };
  jest.clearAllMocks();
});

describe("registerCommands", () => {
  it("should throw if envs are missing", async () => {
    process.env = {};
    await expect(registerCommands([SampleCommand])).rejects.toThrow(
      "Missing DISCORD_TOKEN or DISCORD_CLIENT_ID"
    );
  });
  it("should log when an error is thrown", async () => {
    getMock.mockResolvedValueOnce([{ id: "" }]);
    putMock.mockRejectedValueOnce(new Error("error"));
    await registerCommands([SampleCommand], logNoop);
    expect(logNoop).toHaveBeenCalledTimes(2);
  });
  it("should register zero commands to zero guilds", async () => {
    getMock.mockResolvedValueOnce([]);
    await expect(registerCommands([], logNoop)).resolves.toBeUndefined();
    expect(getMock).toHaveBeenCalledTimes(1);
    expect(putMock).toHaveBeenCalledTimes(0);
  });
  it("should register 1 command to 1 guild", async () => {
    getMock.mockResolvedValueOnce([{ id: "1" }]);
    await expect(
      registerCommands([SampleCommand], logNoop)
    ).resolves.toBeUndefined();
    expect(getMock).toHaveBeenCalledTimes(1);
    expect(putMock).toHaveBeenCalledTimes(1);
    expect(putMock).toHaveBeenCalledWith(expect.any(String), {
      body: [SampleCommand.option],
    });
  });
});

describe("validateCommands", () => {
  it("should validate zero commands", () => {
    expect(() => validateCommands([])).not.toThrow();
  });

  it("should validate 1 commands", () => {
    expect(() => validateCommands([SampleCommand])).not.toThrow();
  });

  it("should validate 2 commands with no duplicates", () => {
    expect(() =>
      validateCommands([
        SampleCommand,
        {
          ...SampleCommand,
          option: {
            ...SampleCommand.option,
            name: "sample2",
          },
        },
      ])
    ).not.toThrow();
  });

  it("should throw on duplicate commands", () => {
    expect(() => validateCommands([SampleCommand, SampleCommand])).toThrow();
  });
});
