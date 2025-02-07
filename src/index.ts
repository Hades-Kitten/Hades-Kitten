import { Client, Events, GatewayIntentBits } from "discord.js";

import env from "./env.ts";
import { scheduleChannelNameUpdate } from "./utils/scheduledTasks.ts";
import logger from "./utils/logging.ts";

import registerEvents from "./handlers/events.ts";
import registerInteractions from "./handlers/interactions.ts";
import sseEvents from "./events/sse.ts";

const client = new Client({
  intents: (Object.values(GatewayIntentBits) as (string | number)[])
    .filter((value) => typeof value === "number")
    .reduce((a: number, b: number) => a | b, 0),
});

client.on(Events.ClientReady, async (client) => {
  logger.info(`Logged in as ${client.user?.tag}!`);
  await Promise.all([registerEvents(client), registerInteractions(client)]);
  logger.info("Events and interactions registered!");

  scheduleChannelNameUpdate(client);
  sseEvents.execute(client);
});

await client.login(env.data.TOKEN);

process.on("unhandledRejection", (error) => {
  logger.error("Unhandled promise rejection:", error);
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception:", error);
});
