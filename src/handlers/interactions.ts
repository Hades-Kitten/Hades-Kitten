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

export const commands = new Collection<string, ICommand>();

async function getCommands(): Promise<ICommand[]> {
  const processFile = async (fileUrl: string) => {
    const { default: interaction } = await import(fileUrl);
    if (!interaction.data) {
      console.error(`commands: ${fileUrl} missing data`);
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
    console.log(`commands: registering ${interactions.length} commands`);
    await rest.put(Routes.applicationCommands(<Snowflake>client.user.id), {
      body: interactions,
    });
    console.log(`commands: registered ${interactions.length} commands`);
  } catch (error) {
    console.error("commands: failed to register commands");
    console.error(error);
  }
}

async function registerCommands(client: Client) {
  const commands = await getCommands();
  console.log(`commands: found ${commands.length} commands, registering...`);

  const interactions = commands.map((command) => command.data);
  await registerInteractions(client, interactions);
}

export default registerCommands;
