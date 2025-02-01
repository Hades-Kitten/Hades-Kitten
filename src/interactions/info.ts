import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  type Client,
} from "discord.js";
import { fetch } from "bun";
import { parseStringPromise } from "xml2js";
import type { Nation } from "../types";

function formatNumber(num: number): string {
  if (num >= 1000000000) return `${num / 1000000000}B`;
  if (num >= 1000000) return `${num / 1000000}M`;
  if (num >= 1000) return `${num / 1000}K`;
  return num.toString();
}

const commandData = new SlashCommandBuilder()
  .setName("info")
  .setDescription("Get info about a nation")
  .addStringOption((option) =>
    option
      .setName("nation")
      .setDescription("The nation to get info about")
      .setRequired(true),
  );

async function xmlToJson<JSON>(xml: string): Promise<JSON | null> {
  try {
    return (await parseStringPromise(xml, { explicitArray: false })) as JSON;
  } catch (error) {
    console.error("Error converting XML to JSON:", error);
    return null;
  }
}

export async function execute(
  _client: Client,
  interaction: ChatInputCommandInteraction,
) {
  await interaction.deferReply();

  const nationName = interaction.options.getString("nation", true);
  const apiUrl = `https://www.nationstates.net/cgi-bin/api.cgi?nation=${encodeURIComponent(nationName)}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.text();
    const jsonData = await xmlToJson<{ NATION: Nation }>(data);

    if (!jsonData || !jsonData.NATION) {
      await interaction.editReply("Could not retrieve nation data.");
      return;
    }

    const nationData = jsonData.NATION;
    const embed = new EmbedBuilder()
      .setAuthor({
        name: nationData.FULLNAME,
        iconURL: nationData.FLAG,
        url: `https://www.nationstates.net/nation=${encodeURIComponent(nationName)}`,
      })
      .setDescription(`*"${nationData.MOTTO}"*`)
      .addFields([
        {
          name: "Civil Rights",
          value: nationData.FREEDOM.CIVILRIGHTS || "N/A",
          inline: true,
        },
        {
          name: "Economy",
          value: nationData.FREEDOM.ECONOMY || "N/A",
          inline: true,
        },
        {
          name: "Political Freedom",
          value: nationData.FREEDOM.POLITICALFREEDOM || "N/A",
          inline: true,
        },
        {
          name: "Capital City",
          value: nationData.CAPITAL || "N/A",
          inline: true,
        },
        {
          name: "Population",
          value: nationData.POPULATION
            ? `${formatNumber(Number.parseInt(nationData.POPULATION) * 1000000)} ${nationData.DEMONYM2PLURAL}`
            : "N/A",
          inline: true,
        },
        { name: "Currency", value: nationData.CURRENCY || "N/A", inline: true },
        { name: "Leader", value: nationData.LEADER || "N/A", inline: true },
        { name: "Religion", value: nationData.RELIGION || "N/A", inline: true },
        { name: "Demonym", value: nationData.DEMONYM || "N/A", inline: true },
        {
          name: "Region",
          value:
            `[${nationData.REGION}](https://www.nationstates.net/region=${encodeURIComponent(nationData.REGION)})` ||
            "N/A",
          inline: true,
        },
        {
          name: "Regional Influence",
          value: nationData.INFLUENCE || "N/A",
          inline: true,
        },
        {
          name: "Founded",
          value: nationData.FIRSTLOGIN
            ? `<t:${Math.round(Number.parseInt(nationData.FIRSTLOGIN))}:d>, <t:${Math.round(Number.parseInt(nationData.FIRSTLOGIN))}:t>`
            : "N/A",
          inline: true,
        },
      ]);
    if (nationData.FLAG) embed.setThumbnail(nationData.FLAG);

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error("Error fetching or processing data:", error);
    await interaction.editReply("An error occurred. Try again later? :3");
  }
}

export default {
  data: commandData,
  execute,
};
