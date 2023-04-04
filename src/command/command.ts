import { inspect } from "util";
import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Client,
  Interaction,
} from "discord.js";
import {
  ChatCommand,
  Command,
  CommandInput,
  guardPromise,
  interactionRespond,
  isChatCommand,
  resolveCommand,
} from "./common";
import { handleComponents, isComponentInteraction } from "./component";

export async function handleChatCommand(
  client: Client,
  command: ChatCommand,
  input: CommandInput,
  log = console.log
): Promise<string | void> {
  return guardPromise(
    () => command.handler(input, { command, client }),
    "Failed to handle command:",
    log
  );
}

export async function handleChatInput(
  client: Client,
  commands: Command[],
  interaction: ChatInputCommandInteraction,
  log = console.log
) {
  const command = resolveCommand(commands, interaction.commandName);
  if (!command || !isChatCommand(command)) {
    log(`Unknown command ${interaction.commandName}`);
    await interactionRespond(interaction, {
      content: "Unknown command",
      ephemeral: true,
    });
    return;
  }

  if (command.chat) {
    return guardPromise(
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

  const result = await handleChatCommand(client, command, input);
  if (result) {
    interaction.channel?.send(result);
  }
}

export async function handleAutocomplete(
  client: Client,
  commands: Command[],
  interaction: AutocompleteInteraction,
  log = console.log
): Promise<void> {
  const command = resolveCommand(commands, interaction.commandName);

  if (!command || !isChatCommand(command)) return;

  if (!command.autocomplete) return;

  try {
    await command.autocomplete(interaction, { command, client });
  } catch (err) {
    log("Failed to handle autocomplete: ");
    log(inspect(err));
  }
}

export async function handleInteraction(
  client: Client,
  commands: Command[],
  interaction: Interaction
): Promise<void> {
  if (interaction.isChatInputCommand())
    await handleChatInput(client, commands, interaction);
  else if (interaction.isAutocomplete())
    await handleAutocomplete(client, commands, interaction);
  else if (isComponentInteraction(interaction))
    await handleComponents(client, commands, interaction);
}
