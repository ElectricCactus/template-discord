import {
  ButtonBuilder,
  ModalBuilder,
  StringSelectMenuBuilder,
} from "discord.js";
import { createCustomId } from "./common";

export type Builder = ButtonBuilder | StringSelectMenuBuilder | ModalBuilder;

export function createComponent(
  commandName: string,
  builder: Builder,
  metadata?: Record<string, unknown>
): Builder {
  return builder.setCustomId(
    createCustomId({
      commandName,
      ...metadata,
    })
  );
}
