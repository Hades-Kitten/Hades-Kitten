import {
  type Client,
  type Channel,
  type TextChannel,
  EmbedBuilder,
} from "discord.js";
import { EventSource } from "eventsource";

import xmlToJson from "../utils/xmlToJson";

import Region from "../models/region";
import type {
  RMB,
  Nation as INation,
  Region as IRegion,
  SSEEvent,
} from "../types";

interface NameCache {
  [key: string]: string | undefined;
}
const nameCache: NameCache = {};

function isTextChannel(channel: Channel | undefined): channel is TextChannel {
  if (channel === undefined) return false;
  return channel?.isTextBased();
}

async function getBeautifiedName(
  name: string,
  isRegion = false,
): Promise<string> {
  if (nameCache[name]) return nameCache[name];

  const url = isRegion
    ? `https://www.nationstates.net/cgi-bin/api.cgi?region=${name}&q=name`
    : `https://www.nationstates.net/cgi-bin/api.cgi?nation=${name}&q=name`;

  const response = await fetch(url);
  if (!response.ok) {
    console.error(`Failed to fetch data for ${name}`);
    return name;
  }

  const text = await response.text();
  const json = await xmlToJson<{ NATION: INation } | { REGION: IRegion }>(text);
  if (!json) {
    console.error(`Failed to parse data for ${name}`);
    return name;
  }

  const beautifiedName = "NATION" in json ? json.NATION.NAME : json.REGION.NAME;
  nameCache[name] = beautifiedName;
  return beautifiedName;
}

async function getRegionalMessageBoard(
  region: string,
): Promise<RMB | undefined> {
  const url = `https://www.nationstates.net/cgi-bin/api.cgi?region=${region}&q=messages`;
  const response = await fetch(url);

  if (!response.ok) {
    console.error(`Failed to fetch RMB data: ${region}`);
    return undefined;
  }

  const text = await response.text();
  return xmlToJson(text);
}

async function getDispatchPreview(
  nation: string,
  dispatchId: string,
): Promise<string | undefined> {
  try {
    const dispatchUrl = `https://www.nationstates.net/cgi-bin/api.cgi?nation=${nation}&q=dispatchlist+factbooklist`;
    const response = await fetch(dispatchUrl);

    if (!response.ok) {
      console.error(`Failed to fetch dispatch data: ${nation} ${dispatchId}`);
      return undefined;
    }

    const text = await response.text();
    const contentMatch = text.match(/<TEXT>(.*?)<\/TEXT>/s);
    if (contentMatch) {
      let content = contentMatch[1];
      content = content.replace(/\[b\](.*?)\[\/b\]/g, "**$1**");
      content = content.replace(/\[i\](.*?)\[\/i\]/g, "*$1*");
      content = content.replace(/\[u\](.*?)\[\/u\]/g, "__$1__");
      content = content.replace(/\[url=(.*?)\](.*?)\[\/url\]/g, "[$2]($1)");

      if (content.length > 200) return `${content.slice(0, 200)}...`;
      return content;
    }

    return undefined;
  } catch (error) {
    console.error(
      `Error fetching dispatch preview ${nation} ${dispatchId}`,
      error,
    );
    return undefined;
  }
}

async function parseMessage(message: string): Promise<string> {
  let parsedMessage = message;
  const nationNameMatches = message.match(/@@([^@]+)@@/g);
  if (nationNameMatches) {
    for (const match of nationNameMatches) {
      const nationName = match.slice(2, -2);
      const beautifiedName = await getBeautifiedName(nationName);
      if (beautifiedName) {
        parsedMessage = parsedMessage.replace(
          match,
          `**[${beautifiedName}](https://www.nationstates.net/nation=${nationName})**`,
        );
      } else {
        parsedMessage = parsedMessage.replace(
          match,
          `**[${nationName}](https://www.nationstates.net/nation=${nationName})**`,
        );
      }
    }
  }

  const regionNameMatches = parsedMessage.match(/%%([^%]+)%%/g);
  if (regionNameMatches) {
    for (const match of regionNameMatches) {
      const regionName = match.slice(2, -2);
      const beautifiedName = await getBeautifiedName(regionName, true);
      if (beautifiedName) {
        parsedMessage = parsedMessage.replace(
          match,
          `**[${beautifiedName}](https://www.nationstates.net/region=${regionName})**`,
        );
      } else {
        parsedMessage = parsedMessage.replace(
          match,
          `**[${regionName}](https://www.nationstates.net/region=${regionName})**`,
        );
      }
    }
  }
  parsedMessage = parsedMessage.replace(
    /<a href="([^"]+)">([^<]+)<\/a>/g,
    "[$2](https://www.nationstates.net$1)",
  );

  return parsedMessage;
}

async function handleSSE(client: Client) {
  console.log("Subscribing to SSE events");
  const allRegions = await Region.findAll();

  for (const region of allRegions) {
    if (!region.dataValues.regionName) {
      console.error("Region name not found");
      continue;
    }

    console.log(`\tSubscribing to region: ${region.dataValues.regionName}`);
    const buckets = [
      `region:${region.dataValues.regionName}`,
      "dispatch",
      "rmb",
    ];

    const regionName = region.dataValues.regionName
      .toLowerCase()
      .replace(/ /g, "_");
    const url = `https://www.nationstates.net/api/${buckets.join("+")}`;
    const eventSource = new EventSource(url);

    console.log(`\tSubscribed to buckets: ${buckets.join(", ")}`);

    eventSource.onmessage = async (event) => {
      const data: SSEEvent = JSON.parse(event.data);
      if (!data || !data.str) return;

      const parsedMessage = await parseMessage(data.str);

      if (data.str.includes("Regional Message Board")) {
        if (!region.dataValues.rmbChannelId || !data.str.includes(regionName))
          return;

        const channel = client.channels.cache.get(
          region.dataValues.rmbChannelId,
        );
        if (!isTextChannel(channel)) return;

        const rmb = await getRegionalMessageBoard(region.dataValues.regionName);
        if (!rmb) return;

        const message = rmb?.REGION.MESSAGES.POST[0];
        if (!message) return;

        const embed = new EmbedBuilder()
          .setAuthor({
            name: await getBeautifiedName(message.NATION),
          })
          .setDescription(
            `${message.MESSAGE} - [Open post](https://www.nationstates.net/page=rmb/postid=${message.$?.id})`,
          )
          .setTimestamp(Number.parseInt(message.TIMESTAMP));
        await channel.send({ embeds: [embed] });
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
    };
  }
}

export default {
  event: "sse",
  execute: handleSSE,
};
