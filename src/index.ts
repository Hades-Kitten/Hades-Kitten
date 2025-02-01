import { Client, Events, GatewayIntentBits } from "discord.js";

import env from "./env.ts";

import registerEvents from "./handlers/events.ts";
import registerInteractions from "./handlers/interactions.ts";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on(Events.ClientReady, async (client) => {
  console.log(`Logged in as ${client.user.username} (${client.user.id})`);
  await Promise.all([registerEvents(client), registerInteractions(client)]);
});

await client.login(env.data.TOKEN);
