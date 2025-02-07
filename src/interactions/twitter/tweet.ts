import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  type Client,
  type ModalSubmitInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
  ChannelType,
} from "discord.js";

import Profile from "../../models/profile";
import Tweet from "../../models/tweet";
import Region from "../../models/region";

import autocomplete from "../../utils/handleAutocomplete";

const commandData = new SlashCommandBuilder()
  .setName("post")
  .setDescription("Create a new post")
  .addStringOption((option) =>
    option
      .setName("handle")
      .setDescription("The handle to post from")
      .setAutocomplete(true)
      .setRequired(true),
  );

async function execute(
  _client: Client,
  interaction: ChatInputCommandInteraction,
) {
  const handle = interaction.options.getString("handle", true);

  const profile = await Profile.findOne({
    where: {
      handle,
      guildId: interaction.guildId,
      userId: interaction.user.id,
    },
  });

  if (!profile) {
    await interaction.reply({
      content: "Profile not found or you don't own it!",
      ephemeral: true,
    });
    return;
  }

  const modal = new ModalBuilder()
    .setCustomId(`post:${handle}:modal`)
    .setTitle("Create Post");

  const tweetInput = new TextInputBuilder()
    .setCustomId("tweetContent")
    .setLabel("What's on your mind?")
    .setStyle(TextInputStyle.Paragraph)
    .setMaxLength(280)
    .setRequired(true);

  const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
    tweetInput,
  );

  modal.addComponents(firstActionRow);
  await interaction.showModal(modal);
}

async function modalExecute(
  client: Client,
  interaction: ModalSubmitInteraction,
) {
  await interaction.deferReply({ flags: ["Ephemeral"] });

  const [_command, handle] = interaction.customId.split(":");
  const content = interaction.fields.getTextInputValue("tweetContent");

  const profile = await Profile.findOne({ where: { handle } });
  if (!profile) {
    await interaction.editReply("Profile not found!");
    return;
  }

  const tweet = await Tweet.create({
    profileId: profile.get("id"),
    content,
  });

  const embed = new EmbedBuilder()
    .setAuthor({
      name: `@${handle}`,
      iconURL: (profile.get("profilePicture") as string) ?? undefined,
    })
    .setDescription(content)
    .setTimestamp(tweet.get("timestamp") as Date)
    .setColor("Blue");

  const region = await Region.findOne({
    where: { guildId: interaction.guildId },
  });

  if (!region)
    return interaction.editReply({ content: ":x: Region not found" });

  if (!region.get("tweetChannelId"))
    return interaction.editReply({
      content: ":x: Tweet channel not found, ask an admin to set it up",
    });

  const channel = client.channels.cache.get(
    region.get("tweetChannelId") as string,
  );
  if (!channel)
    return interaction.editReply({ content: ":x: Channel not found" });
  if (channel?.type !== ChannelType.GuildText)
    return interaction.editReply({
      content: ":x: Channel is not a text channel",
    });

  const message = await channel.send({ embeds: [embed] });
  await interaction.editReply({
    content: `Posted! Find it here ${message.url}`,
  });
}

export default {
  data: commandData,
  execute,
  modalExecute,
  autocomplete,
};
