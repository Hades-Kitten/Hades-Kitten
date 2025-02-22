import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  type Client,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ChannelType,
} from "discord.js";
import type { ButtonInteraction } from "discord.js";
import env from "../env";
import type { Nation } from "../types";
import { CENSUSNAME } from "../utils/censusnames";
import formatter from "../utils/formatStringsAndNumbers";
import xmlToJson from "../utils/xmlToJson";

function getAllScoresInArray(
  type: string,
  nationDataA: Nation,
  nationDataB: Nation
): {
  message: string;
  nationAGreaterCount: number;
  nationBGreaterCount: number;
} {
  const scaleArrayA = nationDataA.CENSUS.SCALE;
  const scaleArrayB = nationDataB.CENSUS.SCALE;
  let nationAGreaterCount = 0;
  let nationBGreaterCount = 0;
  let scoresArray: string = "";

  for (let i = 0; i < scaleArrayA.length && scaleArrayB.length; i++) {
    const scaleA = scaleArrayA[i];
    const scaleB = scaleArrayB[i];
    //if ((Number(scaleId) >= 0 && Number(scaleId) <= 80) || (Number(scaleId) >= 85 && Number(scaleId) <= 88)) {

    const scaleId = scaleA.$.id && scaleB.$.id;
    const s = Number(scaleId);

    const socialcensus =
      s == 0 ||
      s == 3 ||
      (s >= 5 && s <= 9) ||
      (s >= 28 && s <= 29) ||
      s == 32 ||
      (s >= 34 && s <= 44) ||
      s == 54 ||
      s == 55 ||
      (s >= 58 && s <= 64) ||
      s == 68 ||
      s == 69 ||
      s == 71 ||
      s == 75 ||
      s == 77 ||
      s == 80 ||
      s == 88 ||
      s == 87;

    const economiccensus =
      s == 1 ||
      s == 4 ||
      (s >= 10 && s <= 26) ||
      s == 31 ||
      s == 33 ||
      (s >= 48 && s <= 50) ||
      (s >= 56 && s <= 57) ||
      (s >= 72 && s <= 74) ||
      s == 76 ||
      s == 78 ||
      s == 79 ||
      s == 85;

    const governmentcensus =
      s == 2 ||
      s == 27 ||
      s == 30 ||
      (s >= 45 && s <= 47) ||
      (s >= 51 && s <= 53) ||
      (s >= 65 && s <= 67) ||
      s == 70 ||
      s == 86;

    if (type === "social" || type === "all") {
      if (socialcensus) {
        let censusCategory = "";

        for (const category in CENSUSNAME) {
          if (CENSUSNAME[category] === Number(scaleId)) {
            censusCategory = category;
            break;
          }
        }

        const categoryName = censusCategory
          ? `${censusCategory}:`
          : `Unknown (${scaleId}):`;

        const scoreA = Number.parseInt(scaleA.SCORE.toString());
        const scoreB = Number.parseInt(scaleB.SCORE.toString());
        const formattedAscore = formatter.formatNumber(
          scaleA.SCORE
        ) as unknown as number;
        const formattedBscore = formatter.formatNumber(
          scaleB.SCORE
        ) as unknown as number;
        let comparisonString: string;
        if (scoreA > scoreB) {
          comparisonString = "`>`";
          nationAGreaterCount++;
        } else if (scoreA < scoreB) {
          comparisonString = "`<`";
          nationBGreaterCount++;
        } else {
          comparisonString = "`=`";
        }
        scoresArray +=
          [
            `**${categoryName}** \u200b ${formattedAscore} ${comparisonString} ${formattedBscore}`,
          ].join("\n") + "\n";
      }
    } else if (type === "economy" || type === "all") {
      if (economiccensus) {
        let censusCategory = "";

        for (const category in CENSUSNAME) {
          if (CENSUSNAME[category] === Number(scaleId)) {
            censusCategory = category;
            break;
          }
        }

        const categoryName = censusCategory
          ? `${censusCategory}:`
          : `Unknown (${scaleId}):`;

        const scoreA = Number.parseInt(scaleA.SCORE.toString());
        const scoreB = Number.parseInt(scaleB.SCORE.toString());
        const formattedAscore = formatter.formatNumber(
          scaleA.SCORE
        ) as unknown as number;
        const formattedBscore = formatter.formatNumber(
          scaleB.SCORE
        ) as unknown as number;
        let comparisonString: string;
        if (scoreA > scoreB) {
          comparisonString = "`>`";
          nationAGreaterCount++;
        } else if (scoreA < scoreB) {
          comparisonString = "`<`";
          nationBGreaterCount++;
        } else {
          comparisonString = "`=`";
        }
        scoresArray +=
          [
            `**${categoryName}** ${formattedAscore} ${comparisonString} ${formattedBscore}`,
          ].join("\n") + "\n";
      }
    } else if (type === "government" || type === "all") {
      if (governmentcensus) {
        let censusCategory = "";

        for (const category in CENSUSNAME) {
          if (CENSUSNAME[category] === Number(scaleId)) {
            censusCategory = category;
            break;
          }
        }

        const categoryName = censusCategory
          ? `${censusCategory}:`
          : `Unknown (${scaleId}):`;

        const scoreA = Number.parseInt(scaleA.SCORE.toString());
        const scoreB = Number.parseInt(scaleB.SCORE.toString());
        const formattedAscore = formatter.formatNumber(
          scaleA.SCORE
        ) as unknown as number;
        const formattedBscore = formatter.formatNumber(
          scaleB.SCORE
        ) as unknown as number;
        let comparisonString: string;
        if (scoreA > scoreB) {
          comparisonString = "`>`";
          nationAGreaterCount++;
        } else if (scoreA < scoreB) {
          comparisonString = "`<`";
          nationBGreaterCount++;
        } else {
          comparisonString = "`=`";
        }
        scoresArray +=
          [
            `**${categoryName}** ${formattedAscore} ${comparisonString} ${formattedBscore}`,
          ].join("\n") + "\n";
      }
    }
  }

  return {
    message: scoresArray,
    nationAGreaterCount: nationAGreaterCount,
    nationBGreaterCount: nationBGreaterCount,
  };
}

function generateScaleString(start: number, end: number): string {
  const numbers: string[] = [];
  for (let i = start; i <= end; i++) {
    numbers.push(i.toString());
  }
  return numbers.join("+");
}

const commandData = new SlashCommandBuilder()
  .setName("compare")
  .setDescription("Compare the stats of 2 nations")
  .addStringOption((option) =>
    option
      .setName("nation_a")
      .setDescription("The first nation")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("nation_b")
      .setDescription("The second nation")
      .setRequired(true)
  );

async function fetchNationData(nationName: string) {
  const apiUrl = `https://www.nationstates.net/cgi-bin/api.cgi?nation=${encodeURIComponent(
    nationName
  )}&q=census+name&scale=${generateScaleString(0, 88)}`;
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

async function resultEmbed(
  nationAData: Nation,
  nationBData: Nation
): Promise<EmbedBuilder> {
  const formattedNationAName = formatter.formatNationName(
    nationAData.NAME as string
  );
  const formattedNationBName = formatter.formatNationName(
    nationBData.NAME as string
  );
  const comparisonResult = getAllScoresInArray(
    "all",
    nationAData as any,
    nationBData as any
  );

  return new EmbedBuilder()
    .setTitle("Comparing Stats")
    .setDescription(
      `${formattedNationAName} is greater than ${formattedNationBName} in ${comparisonResult.nationAGreaterCount} fields, and ${formattedNationBName} is greater than ${formattedNationAName} in ${comparisonResult.nationBGreaterCount} fields`
    );
}
async function socialEmbed(
  nationAData: Nation,
  nationBData: Nation
): Promise<EmbedBuilder> {
  const formattedNationAName = formatter.formatNationName(
    nationAData.NAME as string
  );
  const formattedNationBName = formatter.formatNationName(
    nationBData.NAME as string
  );
  const comparisonResult = getAllScoresInArray(
    "social",
    nationAData as any,
    nationBData as any
  );

  return new EmbedBuilder()
    .setTitle("Comparing Social Stats")
    .setDescription(
      `**Comparing ${formattedNationAName} and ${formattedNationBName}**\n\n ${
        (comparisonResult as any).message
      }`
    );
}
async function economyEmbed(
  nationAData: Nation,
  nationBData: Nation
): Promise<EmbedBuilder> {
  const formattedNationAName = formatter.formatNationName(
    nationAData.NAME as string
  );
  const formattedNationBName = formatter.formatNationName(
    nationBData.NAME as string
  );
  const comparisonResult = getAllScoresInArray(
    "economy",
    nationAData as any,
    nationBData as any
  );

  return new EmbedBuilder()
    .setTitle("Comparing Economic Stats")
    .setDescription(
      `**Comparing ${formattedNationAName} and ${formattedNationBName}**\n\n ${
        (comparisonResult as any).message
      }`
    );
}
async function governmentembed(
  nationAData: Nation,
  nationBData: Nation
): Promise<EmbedBuilder> {
  const formattedNationAName = formatter.formatNationName(
    nationAData.NAME as string
  );
  const formattedNationBName = formatter.formatNationName(
    nationBData.NAME as string
  );
  const comparisonResult = getAllScoresInArray(
    "government",
    nationAData as any,
    nationBData as any
  );

  return new EmbedBuilder()
    .setTitle("Comparing Government Stats")
    .setDescription(
      `**Comparing ${formattedNationAName} and ${formattedNationBName}**\n\n ${
        (comparisonResult as any).message
      }`
    );
}

async function updatePage(
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  nationName_A: string,
  nationName_B: string,
  pageFunctions: ((
    nationAData: Nation,
    nationBData: Nation
  ) => Promise<EmbedBuilder>)[],
  currentPage: number,
  maxPage: number
) {
  const nationAjsonData = await fetchNationData(nationName_A);
  const nationBjsonData = await fetchNationData(nationName_B);

  if (
    (!nationAjsonData && !nationBjsonData) ||
    (!nationBjsonData?.NATION && !nationAjsonData?.NATION)
  ) {
    if (interaction.isCommand()) {
      interaction.deferReply({ flags: ["Ephemeral"] });
      await interaction.editReply("Could not retrieve nation data.");
      return;
    }
    if (interaction.isButton()) {
      interaction.deferReply({ flags: ["Ephemeral"] });
      await interaction.editReply({
        content: "Could not retrieve nation data.",
      });
      return;
    }
    return;
  }

  const nationAData = nationAjsonData?.NATION;
  const nationBData = nationBjsonData?.NATION;

  const embed = await pageFunctions[currentPage](
    nationAData as any,
    nationBData as any
  );

  const buttonRow = new ActionRowBuilder<ButtonBuilder>();
  buttonRow.addComponents([
    new ButtonBuilder()
      .setCustomId(
        `${commandData.name}:${nationName_A}:${nationName_B}:navigate:${
          currentPage - 1
        }`
      )
      .setLabel("Previous")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage === 0),
    new ButtonBuilder()
      .setCustomId(
        `${commandData.name}:${nationName_A}:${nationName_B}:pageindicator`
      )
      .setLabel(`Page ${currentPage + 1} of ${maxPage}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId(
        `${commandData.name}:${nationName_A}:${nationName_B}:navigate:${
          currentPage + 1
        }`
      )
      .setLabel("Next")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage === maxPage - 1),
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
  const nationa = interaction.options.getString("nation_a");
  const nationb = interaction.options.getString("nation_b");

  const pageFunctions = [
    resultEmbed,
    socialEmbed,
    economyEmbed,
    governmentembed,
  ];
  await updatePage(
    interaction,
    nationa as string,
    nationb as string,
    pageFunctions,
    0,
    pageFunctions.length
  );
}

async function buttonExecute(_client: Client, interaction: ButtonInteraction) {
  if (interaction.channel?.type !== ChannelType.GuildText) return;
  const [commandName, nationAName, nationBName, action, pageString] =
    interaction.customId.split(":");

  if (action === "navigate") {
    const page = Number.parseInt(pageString);
    if (Number.isNaN(page)) {
      return await interaction.reply({
        content: "Something went wrong",
        flags: ["Ephemeral"],
      });
    }
    const pageFunctions = [
      resultEmbed,
      socialEmbed,
      economyEmbed,
      governmentembed,
    ];
    await updatePage(
      interaction,
      nationAName,
      nationBName,
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
