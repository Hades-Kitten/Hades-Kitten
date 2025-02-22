import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ChannelType,
  type Client,
  type ButtonInteraction,
  InteractionContextType,
} from "discord.js";
import xmlToJson from "../utils/xmlToJson";
import env from "../env.ts";
import formatter from "../utils/formatStringsAndNumbers.ts";

import type { Nation } from "../types";
import Verify from "../models/verify";

const nationAuthor = (nationData: Nation) => ({
  name: nationData.FULLNAME,
  iconURL: formatter.FormatNSFlag(nationData.FLAG),
  url: `https://www.nationstates.net/nation=${encodeURIComponent(
    nationData.NAME
  )}`,
});

function factbookListFun(nationData: Nation) {
  let factbookembed = "";
  const factbooks = nationData.FACTBOOKLIST?.FACTBOOK || null;
  if (factbooks == null || factbooks.length == (0 as any)) {
    factbookembed += ["Unknown"];
  } else
    for (let i = 0; i < factbooks.length; i++) {
      const id = factbooks[i].$.id;

      const title = factbooks[i].TITLE;
      const extractedTitle = title.replace(/<!\[CDATA\[\]\]>/, "").trim();

      const subcat = factbooks[i].SUBCATEGORY;

      factbookembed +=
        [
          `-> **[${extractedTitle} - ${subcat}](https://www.nationstates.net/nation=${encodeURIComponent(
            nationData.NAME
          )}/detail=factbook/id=${id})**`,
        ].join("\n") + "\n";
      if (factbookembed.length > 4090) {
        factbookembed = factbookembed.toString().substring(0, 4090);
      }
    }
  return { factbookembed };
}
async function factbooksPage(nationData: Nation): Promise<EmbedBuilder> {
  const { factbookembed } = factbookListFun(nationData);
  return new EmbedBuilder()
    .setTitle("Factbooks")
    .setDescription(
      factbookembed || "<:nobitches:1242845720810356867> No Factbooks?"
    );
}

function policiesFun(nationData: Nation) {
  let policyembed = ``;
  let gov = ``;
  let society = ``;
  let economy = ``;
  let international = ``;
  let lowandorder = ``;
  let economicsystem = "";
  for (const policy of nationData.POLICIES?.POLICY ?? []) {
    const name = policy?.NAME;
    const category = policy?.CAT;
    const desc = policy?.DESC;

    if (category == "Government") {
      gov += [`**${name}**`, `> ${desc}`].join("\n") + "\n";
    } else if (category == "Society") {
      society += [`**${name}**`, `> ${desc}`].join("\n") + "\n";
    } else if (category == "Economy") {
      economy += [`**${name}**`, `> ${desc}`].join("\n") + "\n";
    } else if (category == "International") {
      international += [`**${name}**`, `> ${desc}`].join("\n") + "\n";
    } else if (category == "Law & Order") {
      lowandorder += [`**${name}**`, `> ${desc}`].join("\n") + "\n";
    }

    policyembed = `**Government:**\n${gov || "None\n"}\n **Society:**\n${
      society || "None\n"
    }\n **Law & Order:**\n${lowandorder || "None\n"}\n **Economy:**\n${
      economy || "None\n"
    }\n **International:**\n${international || "None\n"}`;

    if (name == "Capitalism") {
      economicsystem =
        ":dollar: Capitalism - an economic and political system in which property, business, and industry are controlled by private owners rather than by the state, with the purpose of making a profit";
    } else if (name === "Socialism") {
      economicsystem =
        ":classical_building: Socialism - a social and economic doctrine that calls for public rather than private ownership or control of property and natural resources.";
    }
  }
  return { economicsystem, policyembed };
}
async function policiesPage(nationData: Nation): Promise<EmbedBuilder> {
  const { policyembed } = policiesFun(nationData);
  return new EmbedBuilder().setTitle("Policies").setDescription(policyembed);
}

function censusFun(nationData: Nation) {
  const scaleArray = nationData.CENSUS.SCALE;
  let economy2 = 0;
  let ecofre = 0;
  let nomgdp = 0;
  let nomgdppercap = 0;
  let populationcensus = 0;
  let poorincome = 0;
  let richincome = 0;
  let wealthgaps = 0;

  for (const scale of scaleArray) {
    const scaleId = scale.$.id;
    const score = Number(scale.SCORE);

    if (scaleId === "1") {
      economy2 = score;
    } else if (scaleId === "48") {
      ecofre = score;
    } else if (scaleId === "76") {
      nomgdp = score;
    } else if (scaleId === "72") {
      nomgdppercap = score;
    } else if (scaleId === "3") {
      populationcensus = score;
    } else if (scaleId === "73") {
      poorincome = score;
    } else if (scaleId === "74") {
      richincome = score;
    } else if (scaleId === "4") {
      wealthgaps = score;
    }
  }
  const ppp = (economy2 / 75) * (Math.pow(Math.pow(ecofre / 500, 2), 0.5) + 1);
  const GPPP = ppp * nomgdp;

  return {
    economy2,
    ecofre,
    nomgdp,
    nomgdppercap,
    populationcensus,
    poorincome,
    richincome,
    wealthgaps,
    ppp,
    GPPP,
  };
}

async function expenditurePage(nationData: Nation): Promise<EmbedBuilder> {
  const { nomgdp } = censusFun(nationData);
  const sectors = nationData.SECTORS;
  const gov = nationData.GOVT;
  return new EmbedBuilder()
    .setTitle(`Expenditure of ${nationData.NAME}`)
    .setDescription(
      `About ${sectors.GOVERNMENT}% of ${formatter.formatNumber(
        nomgdp
      )} Nominal GDP is spent on expenditures (${formatter.formatNumber(
        Math.round(nomgdp * ((sectors.GOVERNMENT as unknown as number) / 100))
      )} Nominal GDP)`
    )
    .addFields(
      {
        name: ":classical_building: Administration",
        value: `${gov.ADMINISTRATION}%`,
        inline: true,
      },
      { name: ":shield: Defence", value: `${gov.DEFENCE}%`, inline: true },
      { name: ":book: Education", value: `${gov.EDUCATION}%`, inline: true },
      {
        name: ":maple_leaf: Environment",
        value: `${gov.ENVIRONMENT}%`,
        inline: true,
      },
      {
        name: ":anatomical_heart: Healthcare",
        value: `${gov.HEALTHCARE}%`,
        inline: true,
      },
      {
        name: ":shopping_bags: Commerce",
        value: `${gov.COMMERCE}%`,
        inline: true,
      },
      {
        name: ":handshake: International Aid",
        value: `${gov.INTERNATIONALAID}%`,
        inline: true,
      },
      {
        name: ":scales: Law and Order",
        value: `${gov.LAWANDORDER}%`,
        inline: true,
      },
      {
        name: ":bullettrain_side: Public Transport",
        value: `${gov.PUBLICTRANSPORT}%`,
        inline: true,
      },
      {
        name: ":peace: Social Equality",
        value: `${gov.SOCIALEQUALITY}%`,
        inline: true,
      },
      {
        name: ":palms_up_together: Spirituality",
        value: `${gov.SPIRITUALITY}%`,
        inline: true,
      },
      { name: ":relieved: Welfare", value: `${gov.WELFARE}%`, inline: true }
    );
}

async function economicPage(nationData: Nation): Promise<EmbedBuilder> {
  const {
    economy2,
    ecofre,
    nomgdp,
    nomgdppercap,
    populationcensus,
    poorincome,
    richincome,
    wealthgaps,
    ppp,
    GPPP,
  } = censusFun(nationData);
  const { economicsystem } = policiesFun(nationData);
  return new EmbedBuilder()
    .setTitle(`Economy of ${nationData.NAME}`)
    .setDescription(
      `The economic system of ${nationData.NAME} is ${economicsystem}\n\n${nationData.INDUSTRYDESC}`
    )
    .addFields(
      {
        name: "**GDP (Nominal)**",
        value: formatter.formatNumber(Math.round(nomgdp)),
      },
      {
        name: "**GDP Per Capita (Nominal)**",
        value: formatter.formatNumber(Number.parseInt(nomgdppercap.toString())),
      },
      {
        name: "**Average Income of Poor (Nominal)**",
        value: formatter.formatNumber(Number.parseInt(poorincome.toString())),
        inline: true,
      },
      {
        name: "**Average Income of Rich (Nominal)**",
        value: formatter.formatNumber(Number.parseInt(richincome.toString())),
        inline: true,
      },
      { name: "**Economic Freedom**", value: formatter.formatNumber(ecofre) },
      { name: "**Economy**", value: formatter.formatNumber(economy2) },
      {
        name: "**Purchasing Power Parity (PPP)**",
        value: `$ ${formatter.formatNumber(ppp)}`,
      },
      {
        name: "**GDP PPP**",
        value: `$ ${formatter.formatNumber(Math.round(GPPP))}`,
      },
      {
        name: "**GDP PPP Per Capita**",
        value: `$ ${formatter.formatNumber(GPPP / populationcensus)}`,
      },
      {
        name: "**Average Income of Poor (PPP)**",
        value: formatter.formatNumber(
          Number.parseInt((poorincome * ppp).toString())
        ),
        inline: true,
      },
      {
        name: "**Average Income of Rich (PPP)**",
        value: formatter.formatNumber(
          Number.parseInt((richincome * ppp).toString())
        ),
        inline: true,
      },
      { name: "**Wealth gap**", value: wealthgaps.toString(), inline: true },
      { name: "**Tax Rates**", value: nationData.TAX, inline: true },
      { name: "**:factory: Major Industry**", value: nationData.MAJORINDUSTRY }
    );
}

async function generateGeneralInformationPage(
  nationData: Nation
): Promise<EmbedBuilder> {
  return new EmbedBuilder()
    .setAuthor(nationAuthor(nationData))
    .setImage(
      `https://www.nationstates.net/images/banners/${nationData.BANNER}.jpg`
    )
    .setDescription(`*"${nationData.MOTTO}"*`)
    .addFields(
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
          ? `${formatter.formatNumber(
              Number.parseInt(nationData.POPULATION) * 1000000
            )} ${nationData.DEMONYM2PLURAL}`
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
          `[${
            nationData.REGION
          }](https://www.nationstates.net/region=${encodeURIComponent(
            nationData.REGION
          )})` || "N/A",
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
          ? `<t:${Math.round(
              Number.parseInt(nationData.FOUNDEDTIME)
            )}:d>, <t:${Math.round(Number.parseInt(nationData.FOUNDEDTIME))}:t>`
          : "N/A",
        inline: true,
      }
    );
}

const commandData = new SlashCommandBuilder()
  .setName("info-user")
  .setDescription("Get info about a nation")
  .setContexts(InteractionContextType.Guild)
  .addMentionableOption((option) =>
    option
      .setName("user")
      .setDescription("The user whose nation to get info about")
      .setRequired(true)
  );
async function fetchNationData(nationName: string) {
  const apiUrl = `https://www.nationstates.net/cgi-bin/api.cgi?nation=${encodeURIComponent(
    nationName
  )}&q=name+tax+majorindustry+region+influence+demonym2plural+demonym2+demonym+animal+industrydesc+demonym+banner+foundedtime+capital+tax+leader+religion+region+census+flag+currency+fullname+freedom+motto+factbooklist+policies+govt+sectors+population&scale=1+48+72+4+73+74+3+76`;
  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "User-Agent": env.data.USER_AGENT,
      },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.text();
    const jsonData = await xmlToJson<{ NATION: Nation }>(data);
    return jsonData;
  } catch (error) {
    console.error("Error fetching or processing data:", error);
    return null;
  }
}

async function updatePage(
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  nationName: string,
  pageFunctions: ((nationData: Nation) => Promise<EmbedBuilder>)[],
  currentPage: number,
  maxPage: number
) {
  const jsonData = await fetchNationData(nationName);
  if (!jsonData || !jsonData.NATION) {
    if (interaction.isCommand()) {
      await interaction.reply("Could not retrieve nation data.");
      return;
    }
    if (interaction.isButton()) {
      await interaction.reply({
        content: "Could not retrieve nation data.",
        flags: ["Ephemeral"],
      });
      return;
    }
    return;
  }

  const nationData = jsonData.NATION;
  const buttonRow = new ActionRowBuilder<ButtonBuilder>();
  const embed = await pageFunctions[currentPage](nationData);
  embed.setFooter({
    text: `Page ${currentPage + 1}/${maxPage}`,
    iconURL: formatter.FormatNSFlag(nationData.FLAG),
  });

  buttonRow.addComponents([
    new ButtonBuilder()
      .setCustomId(
        `${commandData.name}:${nationName}:navigate:${currentPage - 1}`
      )
      .setLabel("Previous")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage === 0),
    new ButtonBuilder()
      .setCustomId(`${commandData.name}:${nationName}:pageindicator`)
      .setLabel(`Page ${currentPage + 1} of ${maxPage}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId(
        `${commandData.name}:${nationName}:navigate:${currentPage + 1}`
      )
      .setLabel("Next")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage === maxPage - 1),
    new ButtonBuilder()
      .setLabel("Open on NationStates")
      .setStyle(ButtonStyle.Link)
      .setURL(
        `https://www.nationstates.net/nation=${encodeURIComponent(
          nationData.NAME
        )}`
      ),
  ]);

  if (interaction.isButton()) {
    if (interaction.user)
      await interaction.message.edit({
        embeds: [embed],
        components: [buttonRow],
      });

    await interaction.deferUpdate();
    return;
  }

  if (interaction.isCommand()) {
    await interaction.reply({
      embeds: [embed],
      components: [buttonRow],
    });
    return;
  }
}

async function execute(
  _client: Client,
  interaction: ChatInputCommandInteraction
) {
  if (interaction.channel?.type !== ChannelType.GuildText) return;

  const mentionedUser = interaction.options.getUser("user");

  let nationToLookup: string | null = null;

  if (mentionedUser !== null) {
    const userData = await Verify.findOne({
      where: { userId: mentionedUser.id, guildId: interaction.guild?.id },
    });

    if (userData) {
      nationToLookup = userData.get("nation") as string | null;
    }
    if (!nationToLookup)
      return await interaction.reply(
        "This user's data is not available in the database. It could be that the user hasn't verified."
      );
  }
  if (nationToLookup) {
    const pageFunctions = [
      generateGeneralInformationPage,
      economicPage,
      expenditurePage,
      policiesPage,
      factbooksPage,
    ];
    await updatePage(
      interaction,
      nationToLookup,
      pageFunctions,
      0,
      pageFunctions.length
    );
  }
}

async function buttonExecute(_client: Client, interaction: ButtonInteraction) {
  if (interaction.channel?.type !== ChannelType.GuildText) return;
  const [commandName, nationName, action, pageString] =
    interaction.customId.split(":");

  if (action === "navigate") {
    const page = Number.parseInt(pageString);
    if (Number.isNaN(page)) {
      return await interaction.followUp({
        content: "Something went wrong",
        flags: ["Ephemeral"],
      });
    }
    const pageFunctions = [
      generateGeneralInformationPage,
      economicPage,
      expenditurePage,
      policiesPage,
      factbooksPage,
    ];
    await updatePage(
      interaction,
      nationName,
      pageFunctions,
      page,
      pageFunctions.length
    );
  }
}

export default {
  data: commandData,
  execute,
  buttonExecute,
};
