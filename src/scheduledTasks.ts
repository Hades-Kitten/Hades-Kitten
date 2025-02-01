import type { Client, GuildBasedChannel } from "discord.js";
import cron from "node-cron";

import env from "./env.ts";

async function updateChannelName(client: Client) {
  // TODO: don't use env variables for the channel id.
  //       when we implement a database, the guild schema should have a
  //       field for the quarterly update channel
  const channelID = env.data.DATE_CHANNEL_ID;
  const channel = client.channels.cache.get(channelID) as GuildBasedChannel;
  if (!channel) {
    console.error("Channel not found");
    return;
  }

  try {
    const currentName = channel.name;
    const [yearStr, quarterStr] = currentName.split(" Q");
    const year = Number.parseInt(yearStr);
    const quarter = Number.parseInt(quarterStr);

    if (
      Number.isNaN(year) ||
      Number.isNaN(quarter) ||
      quarter < 1 ||
      quarter > 4
    ) {
      console.error(`Invalid channel name format: ${currentName}`);
      return;
    }

    let newQuarter = quarter + 1;
    let newYear = year;
    if (newQuarter > 4) {
      newQuarter = 1;
      newYear++;
    }

    console.log(`New year: ${newYear}, quarter: ${newQuarter}`);

    const newChannelName = `${newYear} Q${newQuarter}`;
    await channel.setName(newChannelName, "Quarterly update");
  } catch (error) {
    console.error("Error updating channel name:", error);
  }
}

export function scheduleChannelNameUpdate(client: Client) {
  cron.schedule(
    "0 4 * * *",
    () => {
      updateChannelName(client);
    },
    {
      scheduled: true,
      timezone: "Etc/UTC",
    },
  );
}
