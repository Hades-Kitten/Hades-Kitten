import { Client, Events, GatewayIntentBits } from "discord.js";
import env from "./env.ts";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on(Events.ClientReady, async (client) => {
  console.log(`Logged in as ${client.user.username} (${client.user.id})`);
});

await client.login(env.data.TOKEN);
