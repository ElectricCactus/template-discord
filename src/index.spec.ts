import { main } from ".";
import { registerCommands } from "./register";

const mockLogin = jest.fn().mockResolvedValue(undefined);
const mockRegisterCommands = jest.mocked(registerCommands);

jest.mock("discord.js", () => ({
  ...jest.requireActual("discord.js"),
  Client: jest.fn().mockImplementation(() => ({
    once: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    login: mockLogin,
  })),
}));

jest.mock("./register", () => ({
  registerCommands: jest.fn().mockResolvedValue(undefined),
}));

beforeAll(() => {
  process.env = {
    ...process.env,
    DISCORD_TOKEN: "token",
  };
});

describe("main", () => {
  it("should start properly", async () => {
    await expect(main()).resolves.toBeUndefined();
    expect(mockLogin).toHaveBeenCalledTimes(1);
    expect(mockRegisterCommands).toHaveBeenCalledTimes(1);
  });
});
