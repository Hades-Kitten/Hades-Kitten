import {
  type ButtonInteraction,
  type ChatInputCommandInteraction,
  type Client,
  type ModalSubmitInteraction,
  type StringSelectMenuInteraction,
  type BaseGuildTextChannel,
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
  ChannelType,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} from "discord.js";

import Profile from "../../models/profile";
import Tweet from "../../models/tweet";
import Region from "../../models/region";

import autocomplete from "../../utils/handleAutocomplete";
import { getProfileEmbed } from "../../utils/commands/twitter/profile";

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

  const [_command, handle, ...rest] = interaction.customId.split(":");

  switch (rest[0]) {
    case "modal": {
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

      const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`post:${tweet.get("id")}:reply`)
          .setLabel("Reply")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`post:${tweet.get("id")}:viewProfile:${handle}`)
          .setLabel("View Profile")
          .setStyle(ButtonStyle.Secondary),
      );

      const message = await channel.send({
        embeds: [embed],
        components: [buttonRow],
      });

      await tweet.update({ messageId: message.id });

      await interaction.editReply({
        content: `Posted! Find it here ${message.url}`,
      });
      break;
    }
    case "reply": {
      if (!interaction.channelId) return;
      const tweetId = rest[1];
      const content = interaction.fields.getTextInputValue("replyContent");

      const tweet = await Tweet.findOne({ where: { id: tweetId } });
      if (!tweet) return await interaction.editReply("Tweet not found!");
      const interactionChannel = client.channels.cache.get(
        interaction.channelId,
      ) as BaseGuildTextChannel;

      const message = await interactionChannel.messages.fetch(
        tweet.get("messageId") as string,
      );

      const profile = await Profile.findOne({ where: { handle } });
      if (!profile) return await interaction.editReply("Profile not found!");

      const embed = new EmbedBuilder()
        .setAuthor({
          name: `@${handle}`,
          iconURL: (profile.get("profilePicture") as string) ?? undefined,
        })
        .setDescription(
          `
          ${content}`,
        )
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

      const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(`post:${tweet.get("id")}:reply`)
          .setLabel("Reply")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`post:${tweet.get("id")}:viewProfile:${handle}`)
          .setLabel("View Profile")
          .setStyle(ButtonStyle.Secondary),
      );

      const replyModel = await Tweet.create({
        profileId: profile.get("id"),
        content,
        replyToTweetId: tweet.get("id"),
      });

      const replyMessage = await message.reply({
        embeds: [embed],
        components: [buttonRow],
      });

      await replyModel.update({ messageId: replyMessage.id });
      await interaction.editReply({
        content: `Replied! Find it here ${replyMessage.url}`,
      });

      break;
    }
    default:
      break;
  }
}

async function buttonExecute(_client: Client, interaction: ButtonInteraction) {
  const [_command, tweetId, ...rest] = interaction.customId.split(":");
  const tweet = await Tweet.findOne({ where: { id: tweetId } });

  if (!tweet) {
    await interaction.reply("Tweet not found!");
    return;
  }

  switch (rest[0]) {
    case "reply": {
      const profiles = await Profile.findAll({
        where: { userId: interaction.user.id, guildId: interaction.guildId },
      });

      if (profiles.length === 0)
        return await interaction.reply("Create a profile first.");

      const options = profiles.map((profile) => ({
        label: `@${profile.get("handle")}`,
        value: profile.get("handle") as string,
      }));

      const select = new StringSelectMenuBuilder()
        .setCustomId(`post:${tweetId}:pickProfile`)
        .setPlaceholder("Select a profile")
        .setOptions(options);

      const firstActionRow =
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
      await interaction.reply({
        content: "Pick a profile",
        components: [firstActionRow],
        flags: ["Ephemeral"],
      });

      break;
    }

    case "viewProfile": {
      const handle = rest[1];
      const embed = await getProfileEmbed(handle);
      if (!embed) return await interaction.reply("Profile not found!");
      await interaction.reply({ embeds: [embed], flags: ["Ephemeral"] });
    }
  }
}

async function selectMenuExecute(
  _client: Client,
  interaction: StringSelectMenuInteraction,
) {
  const [_command, tweetId, ...rest] = interaction.customId.split(":");
  const tweet = await Tweet.findOne({ where: { id: tweetId } });

  if (!tweet) {
    await interaction.reply("Tweet not found!");
    return;
  }

  const handle = interaction.values[0];
  const profile = await Profile.findOne({ where: { handle } });

  if (!profile) {
    await interaction.reply("Profile not found!");
    return;
  }

  const modal = new ModalBuilder()
    .setCustomId(`post:${handle}:reply:${tweetId}`)
    .setTitle(`Reply to @${tweet.get("handle")}'s tweet`);

  const replyInput = new TextInputBuilder()
    .setCustomId("replyContent")
    .setLabel("What's on your mind?")
    .setStyle(TextInputStyle.Paragraph)
    .setMaxLength(280)
    .setRequired(true);

  const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
    replyInput,
  );

  modal.addComponents(firstActionRow);
  await interaction.showModal(modal);
}

export default {
  data: commandData,
  execute,
  modalExecute,
  buttonExecute,
  selectMenuExecute,
  autocomplete,
};
