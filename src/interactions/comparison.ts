import {
    type ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
    type Client,
    PermissionFlagsBits,
    InteractionContextType,
} from "discord.js";
import xmlToJson from "../utils/xmlToJson";
import env from "../env";
import type { Nation } from "../types";
import formatter from "../utils/formatStringsAndNumbers";

const commandData = new SlashCommandBuilder()
    .setName("compare")
    .setDescription("Compare the stats of 2 nations")
    .setContexts(InteractionContextType.Guild)
    .addStringOption((option) =>
        option
            .setName("nation_a")
            .setDescription("The first nation")
            .setRequired(true),
    )
    .addStringOption((option) =>
        option
            .setName("nation_b")
            .setDescription("The second nation")
            .setRequired(true),
    );

async function execute(
    _client: Client,
    interaction: ChatInputCommandInteraction,
) {
    const nationa = interaction.options.getString("nation_a")
    const nationb = interaction.options.getString("nation_b")

    function generateScaleString(start: number, end: number): string {
        const numbers: string[] = [];
        for (let i = start; i <= end; i++) {
            numbers.push(i.toString());
        }
        return numbers.join("+");
    }

    async function fetchNationData(nationName: string) {
        const apiUrl = `https://www.nationstates.net/cgi-bin/api.cgi?nation=${encodeURIComponent(nationName)}&q=census&scale=${generateScaleString(0, 88)}`;
        try {
            const response = await fetch(apiUrl, {
                method: "GET",
                headers: {
                    'User-Agent': env.data.USER_AGENT
                }
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

    const nationAjsonData = await fetchNationData(nationa as string);
    const nationBjsonData = await fetchNationData(nationb as string);

    if (!nationAjsonData && !nationBjsonData || !nationBjsonData.NATION && !nationAjsonData.NATION) {
        if (interaction.isCommand()) {
            await interaction.reply("Could not retrieve nation data.");
            return;
        }
        if (interaction.isButton()) {
            return await interaction.reply({
                content: "Could not retrieve nation data.",
                flags: ["Ephemeral"],
            });
        }
        return;
    }

    const nationAData = nationAjsonData.NATION;
    const nationBData = nationBjsonData.NATION;

    function getAllScoresInArray(nationData: Nation): string {
        const scaleArray = nationData.CENSUS.SCALE;
        let scoresArray: string = "";

        for (const scale of scaleArray) {
            const scaleId = scale.$.id;

            if (Number(scaleId) >= 1 && Number(scaleId) <= 88) {
                scoresArray += [ `${formatter.formatNumber(scale.SCORE)}`].join("\n") + "\n";
            }
        }

        return scoresArray;
    }
    console.log(getAllScoresInArray(nationAData));

    const embed = new EmbedBuilder()
        .setTitle("Comparing Stats")
        .setDescription(getAllScoresInArray(nationAData))
    await interaction.reply({ embeds: [embed]})
}

export default {
    data: commandData,
    execute
};