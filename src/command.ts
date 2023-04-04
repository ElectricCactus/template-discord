import { inspect } from "util";

import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Client,
  Guild,
  Message,
  SlashCommandBuilder,
  TextBasedChannel,
} from "discord.js";
import { MessagePayload } from "discord.js";
import { InteractionReplyOptions } from "discord.js";

export type InputValueType = string | number | boolean;

export type InputResolver =
  | ((key: string) => InputValueType | undefined)
  | ((key: string, required: true) => InputValueType);

export type CommandInput = {
  name: string;
  resolver: InputResolver;
};

export type CommandContext<T> = {
  command: T;
  client: Client;
  channel?: TextBasedChannel;
  guild?: Guild;
};

export interface ChatCommand {
  option: ReturnType<SlashCommandBuilder["toJSON"]>;
  handler: (
    input: CommandInput,
    context: CommandContext<this>
  ) => Promise<string>;
  chat?: (
    interaction: ChatInputCommandInteraction,
    context: CommandContext<this>
  ) => Promise<void>;
  autocomplete?: (
    interaction: AutocompleteInteraction,
    context: CommandContext<this>
  ) => Promise<void>;
}

export function resolveCommand(
  commands: ChatCommand[],
  name: string
): ChatCommand | undefined {
  return commands.find((command) => command.option.name === name);
}

export async function guardCommand<T>(
  fn: () => Promise<T>,
  errHandler: string | ((err: unknown) => void | Promise<void>),
  log = console.log
): Promise<T | void> {
  try {
    return await fn();
  } catch (err) {
    log(inspect(err));
    if (typeof errHandler === "string") {
      log(errHandler);
    } else {
      await errHandler(err);
    }
  }
}

export async function handleCommand(
  client: Client,
  command: ChatCommand,
  input: CommandInput,
  log = console.log
): Promise<string | void> {
  return guardCommand(
    () => command.handler(input, { command, client }),
    "Failed to handle command:",
    log
  );
}

export async function interactionRespond(
  interaction: ChatInputCommandInteraction,
  response: string | MessagePayload | InteractionReplyOptions
): Promise<void> {
  if (interaction.replied) {
    await interaction.followUp(response);
  } else {
    await interaction.reply(response);
  }
}

export async function handleChat(
  client: Client,
  commands: ChatCommand[],
  interaction: ChatInputCommandInteraction,
  log = console.log
) {
  const command = resolveCommand(commands, interaction.commandName);
  if (!command) {
    log(`Unknown command ${interaction.commandName}`);
    await interactionRespond(interaction, {
      content: "Unknown command",
      ephemeral: true,
    });
    return;
  }

  if (command.chat) {
    return guardCommand(
      async () => command.chat?.(interaction, { command, client }),
      async (err) => {
        const errMessage =
          typeof err === "object" && err !== null && "message" in err
            ? err.message
            : err;
        log(`Failed to handle command: ${errMessage}`);
        log(inspect(err));
        await interactionRespond(interaction, {
          content: `Failed to handle command: ${errMessage}`,
          ephemeral: true,
        });
      },
      log
    );
  }

  const input = {
    name: interaction.commandName,
    resolver(key: string, required = false) {
      const option = interaction.options.get(key, required);
      if (option === null && required)
        throw new Error(`Missing required option ${key}`);
      return option?.value;
    },
  };

  const result = await handleCommand(client, command, input);
  if (result) {
    interaction.channel?.send(result);
  }
}

export async function handleMessage(
  client: Client,
  commands: ChatCommand[],
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

  if (!command) {
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

  await handleCommand(client, command, input);
}

export async function handleAutocomplete(
  client: Client,
  commands: ChatCommand[],
  interaction: AutocompleteInteraction
): Promise<void> {
  const command = resolveCommand(commands, interaction.commandName);

  if (!command?.autocomplete) return;

  try {
    await command.autocomplete(interaction, { command, client });
  } catch (err) {
    // todo: error handling
  }
}
