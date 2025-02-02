import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  type Client,
  type ButtonInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  type ModalSubmitInteraction,
} from "discord.js";

import xmlToJson from "../utils/xmlToJson";
import Verify from "../models/verify";
import type { VerifyData } from "../types";

const commandData = new SlashCommandBuilder()
  .setName("verify")
  .setDescription("Verify your nation")
  .addStringOption((option) =>
    option
      .setName("nation")
      .setDescription("Your nation name")
      .setRequired(true),
  );

async function execute(
  _client: Client,
  interaction: ChatInputCommandInteraction,
) {
  const nationName = interaction.options.getString("nation", true);

  const verificationButton = new ButtonBuilder()
    .setCustomId(`${commandData.name}:${nationName}:verify`)
    .setLabel("Verify")
    .setStyle(ButtonStyle.Primary);

  const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    verificationButton,
  );

  const embed = new EmbedBuilder()
    .setTitle("Verify Your Nation")
    .setDescription(
      `Please go to [NationStates](https://www.nationstates.net/page=verify_login) to obtain your verification code. Then click the button to verify the nation: ${nationName}`,
    )
    .setColor("Random");

  await interaction.reply({
    embeds: [embed],
    components: [buttonRow],
    flags: ["Ephemeral"],
  });
}

async function buttonExecute(_client: Client, interaction: ButtonInteraction) {
  const [commandName, nationName] = interaction.customId.split(":");

  const modal = new ModalBuilder()
    .setCustomId(`${commandName}:${nationName}:modal`)
    .setTitle("Nation Verification");

  const verificationCodeInput = new TextInputBuilder()
    .setCustomId("verificationCode")
    .setLabel("Verification Code")
    .setStyle(TextInputStyle.Short)
    .setPlaceholder("Enter your verification code")
    .setRequired(true);

  const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
    verificationCodeInput,
  );

  modal.addComponents(firstActionRow);
  await interaction.showModal(modal);
}

async function modalExecute(
  _client: Client,
  interaction: ModalSubmitInteraction,
) {
  const [_commandName, nationName] = interaction.customId.split(":");

  const code = interaction.fields.getTextInputValue("verificationCode");

  await interaction.deferReply({ flags: ["Ephemeral"] });

  const [data] = await Verify.findOrCreate({
    where: { userId: interaction.user.id, guildId: interaction.guild?.id },
  });

  await data.update({ nation: nationName, code });

  const VerificationApiUrl = `https://www.nationstates.net/cgi-bin/api.cgi?a=verify&nation=${nationName}&checksum=${code}`;

  try {
    const response = await fetch(VerificationApiUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const apiData = await response.text();
    const xml = `<result>${apiData}</result>`;
    const jsonData = await xmlToJson<VerifyData>(xml);

    if (!jsonData) {
      await interaction.editReply({
        content: "Could not retrieve nation data, please try again.",
      });
      return;
    }

    const result = jsonData.result.replace("\n", "");

    if (result === "1") {
      const embed = new EmbedBuilder()
        .setColor("Green")
        .setTitle("Succesfully verified!")
        .setDescription(`Welcome ${nationName}, enjoy your stay!`);
      await interaction.editReply({ embeds: [embed] });
    } else if (result === "0") {
      if (interaction.guild)
        await Verify.destroy({
          where: { userId: interaction.user.id, guildId: interaction.guild.id },
        });
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("Not successful try again!")
        .setDescription(
          "Properly input your nation and login code in order to verify",
        );
      await interaction.editReply({ embeds: [embed] });
    } else {
      await interaction.editReply({
        content: "Could not retrieve nation data, please try again.",
      });
    }
  } catch (error) {
    console.error("Error fetching or processing data:", error);
    await interaction.editReply({
      content:
        "An error occurred while fetching or processing data. Did you spell the nation name correctly?",
    });
  }
}

export default {
  data: commandData,
  execute,
  buttonExecute,
  modalExecute,
};
