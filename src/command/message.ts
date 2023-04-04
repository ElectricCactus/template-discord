import { Client, Message } from "discord.js";
import { handleChatCommand } from "./command";
import { Command, isChatCommand, resolveCommand } from "./common";

export async function handleMessage(
  client: Client,
  commands: Command[],
  message: Message
) {
  if (!message.content.startsWith("/exec")) {
    return;
  }
  const [, blob] = message.content.split(" ");

  const {
    command: name,
    payload,
  }: {
    command: string;
    payload: Record<string, unknown>;
  } = JSON.parse(Buffer.from(blob, "base64").toString("utf8"));

  const command = resolveCommand(commands, name);

  if (!command || !isChatCommand(command)) {
    await message.channel.send(`Unknown command ${name}`);
    return;
  }

  const input = {
    name,
    resolver(key: string, required = false) {
      const value = payload[key];
      if (value === undefined && required)
        throw new Error(`Missing required option ${key}`);
      return value as string | number | boolean;
    },
  };

  await handleChatCommand(client, command, input);
}
