import type { Client, GuildBasedChannel } from "discord.js";
import cron from "node-cron";
import Region from "../models/region.ts";
import type { RegionInstance } from "../types.ts";

async function updateChannelName(client: Client, region: RegionInstance) {
  const channelID = region.dateChannelId;
  const channel = client.channels.cache.get(channelID) as GuildBasedChannel;

  if (!channel) {
    console.error(`Channel not found for region ${region.regionName}`);
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

    const newChannelName = `${newYear} Q${newQuarter}`;
    await channel.setName(newChannelName, "Quarterly update");
  } catch (error) {
    console.error("Error updating channel name:", error);
  }
}

export async function scheduleChannelNameUpdate(client: Client) {
  cron.schedule(
    "0 4 * * *",
    async () => {
      const allRegions = (await Region.findAll()) as RegionInstance[];
      for (const region of allRegions) await updateChannelName(client, region);
    },
    {
      scheduled: true,
      timezone: "Etc/UTC",
    },
  );
}
