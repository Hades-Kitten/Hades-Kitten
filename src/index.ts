console.clear();

import { Client, Events, GatewayIntentBits } from "discord.js";

import env from "./env.ts";
import { scheduleChannelNameUpdate } from "./utils/scheduledTasks.ts";
import logMessage from "./utils/logging.ts";

import registerEvents from "./handlers/events.ts";
import registerInteractions from "./handlers/interactions.ts";

const client = new Client({
  intents: (Object.values(GatewayIntentBits) as (string | number)[])
    .filter((value) => typeof value === "number")
    .reduce((a: number, b: number) => a | b, 0),
});

client.on(Events.ClientReady, async (client) => {
  logMessage(
    `Logged in as ${client.user.username} (${client.user.id})`,
    "INFO",
  );
  await Promise.all([registerEvents(client), registerInteractions(client)]);
  scheduleChannelNameUpdate(client);
});

await client.login(env.data.TOKEN);
