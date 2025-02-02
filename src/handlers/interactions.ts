import {
  type ApplicationCommandData,
  type Client,
  Collection,
  Routes,
  type Snowflake,
  REST,
} from "discord.js";
import type { ICommand } from "../types.ts";
import env from "../env.ts";
import { crawlDirectory, getHandlerPath } from "./_common.ts";
import logMessage from "../utils/logging.ts";

export const commands = new Collection<string, ICommand>();

async function getCommands(): Promise<ICommand[]> {
  const processFile = async (fileUrl: string) => {
    const { default: interaction } = await import(fileUrl);
    if (!interaction.data) {
      logMessage(`commands: ${fileUrl} missing data`, 'ERROR');
      return;
    }
    commands.set(interaction.data.name, interaction);
    return interaction;
  };

  return await crawlDirectory<ICommand>(
    getHandlerPath("interactions"),
    processFile,
  );
}

async function registerInteractions(
  client: Client,
  interactions: ApplicationCommandData[],
) {
  if (!client.user || !client.application) {
    console.error("Client user or application not found");
    return;
  }

  const rest = new REST({ version: "9" }).setToken(env.data.TOKEN);

  try {
    logMessage(`commands: registering ${interactions.length} commands`, 'INFO');
    await rest.put(Routes.applicationCommands(<Snowflake>client.user.id), {
      body: interactions,
    });
    logMessage(`commands: registered ${interactions.length} commands`, 'INFO');
  } catch (error) {
    logMessage("commands: failed to register commands", 'ERROR');
    console.error(error);
  }
}

async function registerCommands(client: Client) {
  const commands = await getCommands();
  logMessage(`commands: found ${commands.length} commands, registering...`, 'INFO');

  const interactions = commands.map((command) => command.data);
  await registerInteractions(client, interactions);
}

export default registerCommands;
