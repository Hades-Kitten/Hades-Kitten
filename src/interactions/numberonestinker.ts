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
    const funfacts = [
        "Fun fact: People have reported that they could smell khls from 500 Meters away",
        "Fun fact: Khls lives rent free in all of our heads (False)",
        "Fun fact: Khls is 102 years old", 
        "Fun fact: Khls is a dog", 
        "Fun fact: Khls lives somewhere in the UK and has evaded taxes", 
        "Fun fact: Khls last shower was on August 6th 1954 according to Historical Archives",
        "Fun fact: Khls is not just a \"guy guy\" HE IS A BRITISH GUY :flag_gb :flag_gb:",
        "Fun fact: Khls is the reason why Liberals exist" 
    ]
    await interaction.reply(`${funfacts[Math.floor(Math.random() * funfacts.length)]}\n https://stinkernumber.one/`)
}

export default {
    data: commandData,
    execute
  };