import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ComponentType,
  ButtonStyle,
  ActionRowBuilder,
  ButtonBuilder,
  type Client,
  ChannelType,
} from "discord.js";
import { fetch } from "bun";
import { parseStringPromise } from "xml2js";
import type { Nation } from "../types";
import Verify from "../models/verify";

async function xmlToJson<JSON>(xml: string): Promise<JSON | null> {
  try {
    return (await parseStringPromise(xml, { explicitArray: false })) as JSON;
  } catch (error) {
    console.error("Error converting XML to JSON:", error);
    return null;
  }
}

function formatNumber(num: number): string {
  if (num >= 1000000000) return `${num / 1000000000}B`;
  if (num >= 1000000) return `${num / 1000000}M`;
  if (num >= 1000) return `${num / 1000}K`;
  return num.toString();
}


const author = (nationData: Nation) => ({
  name: nationData.FULLNAME,
  iconURL: nationData.FLAG,
  url: `https://www.nationstates.net/nation=${encodeURIComponent(nationData.NAME)}`,
});

let economy2: any, ecofre: any, nomgdp: any, nomgdppercap: any, populationcensus: any, poorincome: any, richincome: any, wealthgaps: any = "";

async function generateGeneralInformationPage(
  nationData: Nation,
): Promise<EmbedBuilder> {
  return new EmbedBuilder()
    .setAuthor(author(nationData))
    .setImage(
      `https://www.nationstates.net/images/banners/${nationData.BANNER}.jpg`,
    )
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
        value: nationData.FOUNDEDTIME
          ? `<t:${Math.round(Number.parseInt(nationData.FOUNDEDTIME))}:d>, <t:${Math.round(Number.parseInt(nationData.FOUNDEDTIME))}:t>`
          : "N/A",
        inline: true,
      },
    ]);
}

const commandData = new SlashCommandBuilder()
  .setName("info")
  .setDescription("Get info about a nation")
  .addStringOption((option) =>
    option
      .setName("nation")
      .setDescription("The nation to get info about")
      .setRequired(false),
  )
  .addStringOption((option) =>
    option
      .setName("region")
      .setDescription("The region to get info about")
      .setRequired(false),
  )
  .addMentionableOption((option) =>
    option
      .setName("user")
      .setDescription("The user whose nation to get info about")
      .setRequired(false),
  )


export async function execute(
  _client: Client,
  interaction: ChatInputCommandInteraction,
) {
  if (interaction.channel?.type !== ChannelType.GuildText) return;
  await interaction.deferReply();

  const nationName = interaction.options.getString("nation");
  const user = interaction.options.getUser("user") || interaction.user;

  if (user || nationName) {
    const userData = await Verify.findOne({ where: { userId: user.id, guildId: interaction.guild?.id } });
    if (!userData) {
      return await interaction.editReply("This user's data is not available in the database. It could be that the user hasn't verified.")
    }

    const apiUrl = `https://www.nationstates.net/cgi-bin/api.cgi?nation=${encodeURIComponent(nationName || userData.nation || null)}&q=name+tax+majorindustry+region+influence+demonym2plural+demonym2+demonym+animal+industrydesc+demonym+banner+foundedtime+capital+tax+leader+religion+region+census+flag+currency+fullname+freedom+motto+factbooklist+policies+govt+sectors+population&scale=1+48+72+4+73+74+3+76`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.text();
      const jsonData = await xmlToJson<{ NATION: Nation }>(data);

      if (!jsonData || !jsonData.NATION) {
        await interaction.editReply("Could not retrieve nation data.");
        return;
      }

      const pageFunctions = [generateGeneralInformationPage];
      const maxPage = pageFunctions.length;
      let currentPage = 0;

      const updatePage = async (disableAll = false) => {
        const buttonRow = new ActionRowBuilder<ButtonBuilder>();
        const prefix = `${interaction.id}`;
        const embed = await pageFunctions[currentPage](jsonData.NATION);

        if (disableAll)
          buttonRow.addComponents([
            new ButtonBuilder()
              .setCustomId(`${prefix}:expired`)
              .setLabel("This interaction has expired.")
              .setStyle(ButtonStyle.Danger)
              .setDisabled(true),
          ]);

        buttonRow.addComponents([
          new ButtonBuilder()
            .setCustomId(`${prefix}:goto:${currentPage - 1}`)
            .setLabel("Previous")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(currentPage === 0 || disableAll),
          new ButtonBuilder()
            .setCustomId(`${prefix}:pageindicator`)
            .setLabel(`Page ${currentPage + 1} of ${maxPage}`)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId(`${prefix}:goto:${currentPage + 1}`)
            .setLabel("Next")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(currentPage !== maxPage || disableAll),
          new ButtonBuilder()
            .setLabel("Open on NationStates")
            .setStyle(ButtonStyle.Link)
            .setURL(
              `https://www.nationstates.net/nation=${encodeURIComponent(nationName || userData.nation || null)}`,
            ),
        ]);

        await interaction.editReply({ embeds: [embed], components: [buttonRow] });
      };
      await updatePage();

      // TODO: Move away from using a collectors, instead handle button interactions in the interactionCreate event
      //       Will mean there's no time limit (as is currently the case with the 10 minute limit)
      const collector = interaction.channel?.createMessageComponentCollector({
        componentType: ComponentType.Button,
        filter: (i) => i.customId.startsWith(interaction.id),
        time: 600_000, // 10 minutes
      });

      collector?.on("collect", async (i) => {
        if (i.customId.startsWith(`${interaction.id}:goto:`)) {
          const pageNumber = Number.parseInt(i.customId.split(":")[2]);
          if (
            !Number.isNaN(pageNumber) &&
            pageNumber >= 0 &&
            pageNumber < maxPage
          ) {
            currentPage = pageNumber;
            await updatePage();
            await i.deferUpdate();
          }
        }
      });

      collector?.on("end", async () => await updatePage(true));
    } catch (error) {
      console.error("Error fetching or processing data:", error);
      await interaction.editReply(
        "An error occurred while fetching or processing data. Did you spell the nation or region name correctly?",
      );
    }
  } else if (interaction.options.getString("region")) {
    await interaction.reply({ content: "On work", flags: ["Ephemeral"] })
  }
}

export default {
  data: commandData,
  execute,
};
