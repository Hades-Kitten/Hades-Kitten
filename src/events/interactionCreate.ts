import {
  type Client,
  Events,
  type BaseInteraction,
  type ButtonInteraction,
} from "discord.js";
import { commands } from "../handlers/interactions";

export default {
  event: Events.InteractionCreate,
  async execute(client: Client, interaction: BaseInteraction) {
    if (interaction.isCommand()) {
      const command = commands.get(interaction.commandName);
      console.log(`commands: executing ${interaction.commandName}`);
      if (!command) return;
      try {
        await command.execute(client, interaction);
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: "There was an error while executing this command!",
          flags: ["Ephemeral"],
        });
      }
    } else if (interaction.isButton()) {
      const [commandName, ...args] = interaction.customId.split(":");
      const command = commands.get(commandName);
      if (!command || !command.buttonExecute) return;
      try {
        await command.buttonExecute(client, interaction);
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: "There was an error while executing this button command!",
          flags: ["Ephemeral"],
        });
      }
    }
  },
};
