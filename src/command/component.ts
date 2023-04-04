import {
  ButtonInteraction,
  Client,
  ComponentType,
  ContextMenuCommandInteraction,
  ModalSubmitInteraction,
  StringSelectMenuInteraction,
} from "discord.js";
import {
  ChatCommand,
  Command,
  guardPromise,
  isChatCommand,
  isMenuCommand,
  parseCustomId,
} from "./common";

export type ComponentInteraction =
  | ButtonInteraction
  | StringSelectMenuInteraction
  | ModalSubmitInteraction
  | ContextMenuCommandInteraction;

export const supportedComponentInteractionTypes: ComponentType[] = [
  ComponentType.Button,
  ComponentType.TextInput,
  ComponentType.StringSelect,
  ComponentType.RoleSelect,
  ComponentType.UserSelect,
  ComponentType.ChannelSelect,
  ComponentType.MentionableSelect,
];

export function isComponentInteraction(
  interaction: unknown
): interaction is ComponentInteraction {
  return !(
    typeof interaction !== "object" ||
    interaction === null ||
    !("type" in interaction) ||
    !supportedComponentInteractionTypes.includes(
      interaction.type as ComponentType
    )
  );
}

export function componentInteractionName(interaction: ComponentInteraction): {
  commandName: string;
  [key: string]: unknown;
} {
  if ("customId" in interaction) {
    return parseCustomId(interaction.customId) ?? { commandName: "" };
  } else {
    return { commandName: interaction.commandName };
  }
}

export async function handleComponents(
  client: Client,
  commands: Command[],
  interaction: ComponentInteraction,
  log = console.log
): Promise<void> {
  const { commandName, ...metadata } = componentInteractionName(interaction);
  const command = commands.find(
    (command) => command.option.name === commandName
  );
  if (!command) {
    log(`Unknown command ${commandName}`);
    return;
  }
  await handleComponent(client, command, interaction, metadata, log);
}

export async function handleComponent(
  client: Client,
  command: Command,
  interaction: ComponentInteraction,
  metadata: Record<string, unknown>,
  log = console.log
): Promise<void> {
  let fn: (() => Promise<void>) | undefined = undefined;
  if (isChatCommand(command)) {
    const context = { command, client, metadata };
    if (interaction.isButton() && command.button) {
      fn = async () => command.button?.(interaction, context);
    } else if (interaction.isStringSelectMenu() && command.select) {
      fn = async () => command.select?.(interaction, context);
    } else if (interaction.isModalSubmit() && command.modal) {
      fn = async () => command.modal?.(interaction, context);
    } else if (interaction.isContextMenuCommand() && command.menu) {
      fn = async () => command.menu?.(interaction, context);
    }
  } else if (isMenuCommand(command)) {
    const context = { command, client, metadata };
    if (interaction.isContextMenuCommand() && command.menu) {
      fn = async () => command.menu?.(interaction, context);
    }
  }

  if (!fn) {
    log(`Unknown interaction type ${interaction.type}`);
    return;
  }
  await guardPromise(fn, "Failed to handle component:", log);
}
