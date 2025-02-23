import {
  type ChatInputCommandInteraction,
  type Client,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";

const commandData = new SlashCommandBuilder()
  .setName("khls")
  .setDescription("The number one stinker");
async function execute(
  _client: Client,
  interaction: ChatInputCommandInteraction
) {
  const funfacts = [
    "Fun fact: People have reported that they could smell khls from 500 Meters away",
    "Fun fact: Khls lives rent free in all of our heads (False)",
    "Fun fact: Khls is 102 years old",
    "Fun fact: Khls is a dog",
    "Fun fact: Khls lives somewhere in the UK and has evaded taxes",
    "Fun fact: Khls last shower was on August 6th 1954 according to Historical Archives",
    'Fun fact: Khls is not just a "guy guy" HE IS A BRITISH GUY :flag_gb: :flag_gb:',
    "Fun fact: Khls is the reason why Liberals exist",
  ];

  const embed = new EmbedBuilder()
    .setAuthor({
      iconURL:
        "https://cdn.discordapp.com/attachments/1173329838283706411/1343025500041383946/stinkernumberone.png?ex=67bbc577&is=67ba73f7&hm=eb405cfd1b3447ed93a8cac216ac74919d9280ec57d5f94cc654536a2d8e772a&",
      name: "Number one stinker",
    })
    .setDescription(
      `${
        funfacts[Math.floor(Math.random() * funfacts.length)]
      }\n https://stinkernumber.one/`
    )
    .setImage(
      `https://cdn.discordapp.com/attachments/896057518558687272/1343024429504139415/Untitled_video_-_Made_with_Clipchamp_2.gif?ex=67bbc478&is=67ba72f8&hm=b1b3a83c5b322ffce5bac4f0359eaa171c62487e9f6c88bad5ae2d4890f44c4e&`
    );
  return await interaction.reply({ embeds: [embed] });
}

export default {
  data: commandData,
  execute,
};
