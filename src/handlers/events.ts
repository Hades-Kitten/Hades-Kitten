import { type Client, Collection } from "discord.js";
import type { IEvent } from "../types.ts";
import { crawlDirectory, getHandlerPath } from "./_common.ts";

async function getEvents(): Promise<Collection<string, IEvent>> {
  const eventFiles = new Collection<string, IEvent>();

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
  console.log(`events: found ${events.size} events`);

  for (const event of events.values()) {
    console.log(`events: registering event ${event.event}`);
    client[event.once ? "once" : "on"](
      event.event,
      event.execute.bind(null, client),
    );
  }

  console.log(`events: registered ${events.size} events`);
}

export default registerEvents;
