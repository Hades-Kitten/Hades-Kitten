import { type Client, Collection } from "discord.js";
import type { IEvent } from "../types.ts";
import { crawlDirectory, getHandlerPath } from "./_common.ts";
import { Logger } from "../utils/logging.ts";

const logger = new Logger("events");

async function getEvents(): Promise<Collection<string, IEvent>> {
  const eventFiles = new Collection<string, IEvent>();
  logger.info("Loading events...");

  const processFile = async (fileUrl: string) => {
    const { default: event } = await import(fileUrl);
    eventFiles.set(event.event, event);
    return event;
  };

  await crawlDirectory<IEvent>(getHandlerPath("events"), processFile);
  return eventFiles;
}

async function registerEvents(client: Client) {
  const events = await getEvents();
  logger.info(`Found ${events.size} events.`);

  for (const event of events.values()) {
    logger.info(`Registering event: ${event.event}`);
    client[event.once ? "once" : "on"](
      event.event,
      event.execute.bind(null, client),
    );
  }

  logger.info(`Registered ${events.size} events.`);
}

export default registerEvents;
export { logger };
