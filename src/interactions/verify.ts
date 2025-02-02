import {
  type ChatInputCommandInteraction,
  type Message,
  SlashCommandBuilder,
  EmbedBuilder,
  ComponentType,
  ButtonStyle,
  ActionRowBuilder,
  ButtonBuilder,
  type Client,
  ChannelType,
} from "discord.js";
import { parseStringPromise } from "xml2js";
import Verify from "../models/verify";

async function xmlToJson(xml: string) {
  try {
    return (await parseStringPromise(xml, { explicitArray: false })) as JSON;
  } catch (error) {
    console.error("Error converting XML to JSON:", error);
    return null;
  }
}

const commandData = new SlashCommandBuilder()
  .setName("verify")
  .setDescription("Verify your nation")

export async function execute(
  _client: Client,
  interaction: ChatInputCommandInteraction,
) {
  const embed = new EmbedBuilder()
    .setTitle("Verify")
    .setDescription("Verify your nation to continue talking in this server!")
    .setColor("Random")
  await interaction.reply({ embeds: [embed], flags: ["Ephemeral"] })

  const nationEmbed = new EmbedBuilder()
    .setTitle("Input your Nation")
    .setDescription("Write down your nation's name and post it. Warning: it should be `ABCNation` and not `Republic of ABCNation` and others")
    .setColor("Random")
  const msg = await interaction.user.send({ embeds: [nationEmbed] })
  const filter = (m: Message) => interaction.user.id === m.author.id;
  
  const nationCollector = msg.channel.createMessageCollector({ filter: filter, max: 1, Time: 60000 })

  nationCollector.on('collect', async (msg: Message) => {
  const [data] = await Verify.findOrCreate({ where: { userId: interaction.user.id, guildId: interaction.guild?.id } });
    await data.update({ nation: msg.content })

    
      const embed = new EmbedBuilder()
        .setTitle("Input your verification code")
        .setDescription("Go to https://www.nationstates.net/page=verify_login and copy the code and paste it here")
        .setColor("Random")
      await msg.channel?.send({ embeds: [embed] });

      const CodeCollector = await msg.channel?.createMessageCollector({ filter, max: 1, Time: 60000 })

      CodeCollector.on('collect', async (msg: Message) => {
        await data.update({ code: msg.content })
        const apiData = await Verify.findOne({ where: { userId: interaction.user.id, guildId: interaction.guild?.id } })
        if(!apiData) {
          const embed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("Not successful try again!")
            .setDescription(`No data found regarding you`)
          await msg.channel?.send({ embeds: [embed], ephemeral: true }) 
        }
        const VerificationApiUrl = `https://www.nationstates.net/cgi-bin/api.cgi?a=verify&nation=${apiData?.nation}&checksum=${apiData?.code}`

        try {
          const response = await fetch(VerificationApiUrl);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.text();
          const xml = `<result>${data}</result>`;
          const jsonData = await xmlToJson(xml);

          if (!jsonData) {
            await interaction.editReply("Could not retrieve nation data.");
            return;
            } else {
              if (jsonData.result == 1) {
                const embed = new EmbedBuilder()
                  .setColor("Green")
                  .setTitle("Succesfully verified!")
                  .setDescription(`Welcome ${apiData?.nation}, enjoy your stay!`)
                await msg.channel?.send({ embeds: [embed], ephemeral: true })
              } else if (jsonData.result == 0) {
                await Verify.destroy({ where: { userId: msg.author.id, guildId: interaction.guild.id }})

                const embed = new EmbedBuilder()
                  .setColor("Red")
                  .setTitle("Not successful try again!")
                  .setDescription(`Properly input your nation and login code in order to verify`)
                await msg.channel?.send({ embeds: [embed], ephemeral: true })
              }
            }
        } catch (error) {
          console.error("Error fetching or processing data:", error);
          await interaction.editReply(
            "An error occurred while fetching or processing data. Did you spell the nation name correctly?",
          );
        }
        console.log(msg.content)
      })
  })
}


export default {
  data: commandData,
  execute,
};