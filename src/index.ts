console.clear();

import {
  Client,
  Events,
  GatewayIntentBits,
  type GuildBasedChannel,
} from "discord.js";
import cron from "node-cron";

import env from "./env.ts";
import { scheduleChannelNameUpdate } from "./scheduledTasks.ts";
import logMessage from "./utils/logging.ts";

import registerEvents from "./handlers/events.ts";
import registerInteractions from "./handlers/interactions.ts";

const client = new Client({
  intents: Object.values(GatewayIntentBits).reduce((a: any, b: any) => a | b, 0),
});

client.on(Events.ClientReady, async (client) => {
  logMessage(`Logged in as ${client.user.username} (${client.user.id})`, 'INFO');
  await Promise.all([registerEvents(client), registerInteractions(client)]);
  scheduleChannelNameUpdate(client);
});

await client.login(env.data.TOKEN);
