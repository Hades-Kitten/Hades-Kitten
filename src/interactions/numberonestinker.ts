import {
    type ChatInputCommandInteraction,
    SlashCommandBuilder,
    type Client,
} from "discord.js";

const commandData = new SlashCommandBuilder()
    .setName("khls")
    .setDescription("The number one stinker")
async function execute(
    _client: Client,
    interaction: ChatInputCommandInteraction,
) {
    await interaction.reply("https://stinkernumber.one/")
}

export default {
    data: commandData,
    execute
  };