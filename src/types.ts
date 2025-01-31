import type {
  Client,
  ApplicationCommandData,
  BaseInteraction,
  AutocompleteInteraction,
} from "discord.js";

export interface IEvent {
  event: string;
  execute: (client: Client, ...args: unknown[]) => Promise<void>;
  once?: boolean;
}

export interface ICommand {
  data: ApplicationCommandData;
  execute: (client: Client, interaction: BaseInteraction) => Promise<void>;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
}
