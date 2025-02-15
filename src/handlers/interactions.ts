import {
  type ApplicationCommandData,
  type Client,
  Collection,
  REST,
  Routes,
  type Snowflake,
} from "discord.js";
import env from "../env.ts";
import type { ICommand } from "../types.ts";
import { Logger } from "../utils/logging.ts";
import { crawlDirectory, getHandlerPath } from "./_common.ts";

const logger = new Logger("interactions");
export const commands = new Collection<string, ICommand>();

async function getCommands(): Promise<ICommand[]> {
  const processFile = async (fileUrl: string) => {
    const { default: interaction } = await import(fileUrl);
    if (!interaction.data) {
      logger.info(`${fileUrl} does not have a data property, skipping`);
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
  logger.info("Registering interactions...");
  if (!client.user) return logger.error("Client user is not available");
  if (!client.application)
    return logger.error("Client application is not available");

  const rest = new REST({ version: "9" }).setToken(env.data.TOKEN);

  try {
    logger.info("Registering commands...");
    await rest.put(Routes.applicationCommands(<Snowflake>client.user.id), {
      body: interactions,
    });
    logger.info(`Registered ${interactions.length} commands`);
  } catch (error) {
    logger.error("Failed to register commands", error);
  }
}

async function registerCommands(client: Client) {
  const commands = await getCommands();
  logger.log(`Found ${commands.length} commands.`);

  const interactions = commands.map((command) => command.data);
  await registerInteractions(client, interactions);
}

export default registerCommands;
