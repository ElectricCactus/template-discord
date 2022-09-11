import { SlashCommandBuilder } from "discord.js";
import { DiscordChatCommand } from "./command";
import { registerCommands } from "./register";

const SampleCommand: DiscordChatCommand = {
  option: new SlashCommandBuilder()
    .setName("sample")
    .setDescription("Sample Command")
    .toJSON(),
  handler: async () => {},
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

const logNoop = () => {};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("registerCommands", () => {
  it("should register zero commands to zero guilds", async () => {
    getMock.mockResolvedValueOnce([]);
    await expect(registerCommands([], logNoop)).resolves.toBeUndefined();
    expect(getMock).toHaveBeenCalledTimes(1);
    expect(putMock).toHaveBeenCalledTimes(0);
  });

  it("should register 1 commands to 1 guild", async () => {
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
