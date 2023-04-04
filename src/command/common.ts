import { inspect } from "util";
import {
  AutocompleteInteraction,
  ButtonInteraction,
  ChatInputCommandInteraction,
  Client,
  ContextMenuCommandBuilder,
  ContextMenuCommandInteraction,
  Guild,
  InteractionReplyOptions,
  MessagePayload,
  ModalSubmitInteraction,
  SlashCommandBuilder,
  StringSelectMenuInteraction,
  TextBasedChannel,
} from "discord.js";

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
  metadata?: Record<string, unknown>;
};

export type CommandContextWithMetadata<T> = CommandContext<T> &
  Required<Pick<CommandContext<T>, "metadata">>;

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
  button?: (
    interaction: ButtonInteraction,
    context: CommandContextWithMetadata<this>
  ) => Promise<void>;
  select?: (
    interaction: StringSelectMenuInteraction,
    context: CommandContextWithMetadata<this>
  ) => Promise<void>;
  modal?: (
    interaction: ModalSubmitInteraction,
    context: CommandContextWithMetadata<this>
  ) => Promise<void>;
  menu?: (
    interaction: ContextMenuCommandInteraction,
    context: CommandContext<this>
  ) => Promise<void>;
}

export function isChatCommand(command: Command): command is ChatCommand {
  return "handler" in command;
}

export interface MenuCommand {
  type: "menu";
  option: ReturnType<ContextMenuCommandBuilder["toJSON"]>;
  menu: (
    interaction: ContextMenuCommandInteraction,
    context: CommandContext<this>
  ) => Promise<void>;
}

export function isMenuCommand(command: Command): command is MenuCommand {
  return "type" in command && command.type === "menu";
}

export type Command = MenuCommand | ChatCommand;

export function resolveCommand(
  commands: Command[],
  name: string
): Command | undefined {
  return commands.find((command) => command.option.name === name);
}

export async function guardPromise<T>(
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

export function createCustomId(metadata: {
  [key: string]: string;
  commandName: string;
}): string {
  return JSON.stringify(metadata);
}

export function parseCustomId(customId: string):
  | {
      [key: string]: string;
      commandName: string;
    }
  | undefined {
  try {
    return JSON.parse(customId);
  } catch (err) {
    return undefined;
  }
}
