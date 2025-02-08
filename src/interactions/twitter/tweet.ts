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

import newPost from "../../utils/commands/twitter/tweet";

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
    interaction.deferReply({ flags: ["Ephemeral"] });
    await interaction.editReply({
      content: "Profile not found or you don't own it!",
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
  const [_command, handle, ...rest] = interaction.customId.split(":");

  switch (rest[0]) {
    case "modal": {
      const content = interaction.fields.getTextInputValue("tweetContent");
      await newPost(interaction, {
        handle,
        content,
      });

      break;
    }
    case "reply": {
      if (!interaction.channelId) return;
      const tweetId = rest[1];
      const content = interaction.fields.getTextInputValue("replyContent");

      const tweet = await Tweet.findOne({ where: { id: tweetId } });
      if (!tweet)
        return await interaction.reply({
          content: "Tweet not found!",
          flags: ["Ephemeral"],
        });

      await newPost(interaction, {
        handle,
        content,
        replyTo: tweet.get("id") as string,
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
    await interaction.reply({
      content: "Tweet not found!",
      flags: ["Ephemeral"],
    });
    return;
  }

  switch (rest[0]) {
    case "reply": {
      const profiles = await Profile.findAll({
        where: { userId: interaction.user.id, guildId: interaction.guildId },
      });

      if (profiles.length === 0)
        return await interaction.reply({
          content: "Create a profile first.",
          flags: ["Ephemeral"],
        });

      const options = profiles.map((profile) => ({
        label: `@${profile.get("handle")} (${profile.get("displayName")})`,
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

      break;
    }

    case "like": {
      const profiles = await Profile.findAll({
        where: { userId: interaction.user.id, guildId: interaction.guildId },
      });

      if (profiles.length === 0)
        return await interaction.reply({
          content: "Create a profile first.",
          flags: ["Ephemeral"],
        });

      const options = profiles.map((profile) => ({
        label: `@${profile.get("handle")} (${profile.get("displayName")})`,
        value: profile.get("handle") as string,
      }));

      const select = new StringSelectMenuBuilder()
        .setCustomId(`post:${tweetId}:pickLikeProfile`)
        .setPlaceholder("Select a profile to Like with")
        .setOptions(options);

      const firstActionRow =
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
      await interaction.reply({
        content: "Pick a profile to like this post with.",
        components: [firstActionRow],
        flags: ["Ephemeral"],
      });

      break;
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
    await interaction.reply({
      content: "Tweet not found!",
      flags: ["Ephemeral"],
    });
    return;
  }

  if (rest[0] === "pickProfile") {
    const handle = interaction.values[0];
    const profile = await Profile.findOne({ where: { handle } });

    if (!profile) {
      await interaction.reply({
        content: "Profile not found!",
        flags: ["Ephemeral"],
      });
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

    const firstActionRow =
      new ActionRowBuilder<TextInputBuilder>().addComponents(replyInput);

    modal.addComponents(firstActionRow);
    await interaction.showModal(modal);
  } else if (rest[0] === "pickLikeProfile") {
    const handle = interaction.values[0];
    const tweet = await Tweet.findOne({ where: { id: tweetId } });

    if (!tweet) {
      await interaction.reply({
        content: "Tweet not found!",
        flags: ["Ephemeral"],
      });
      return;
    }

    const profile = await Profile.findOne({ where: { handle } });
    if (!profile) {
      await interaction.reply({
        content: "Profile not found!",
        flags: ["Ephemeral"],
      });
      return;
    }

    const likes = tweet.get("likes") as string[];
    const profileId = profile.get("id") as string;

    if (likes.includes(profileId))
      tweet.set(
        "likes",
        likes.filter((id) => id !== profileId),
      );
    else tweet.set("likes", [...likes, profileId]);

    await interaction.deferUpdate();
    await tweet.save();
  }

  const tweetUpdated = await Tweet.findOne({ where: { id: tweetId } });
  if (!tweetUpdated) return await interaction.reply("Tweet not found!");

  const tweetProfile = await Profile.findOne({
    where: { id: tweetUpdated.get("profileId") },
  });
  if (!tweetProfile) {
    await interaction.reply({
      content: "Profile not found!",
      flags: ["Ephemeral"],
    });
    return;
  }
  const newButtonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`post:${tweetUpdated.get("id")}:like`)
      .setEmoji("❤️")
      .setLabel(`${tweetUpdated.getDataValue("likes").length ?? 0}`)
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`post:${tweetUpdated.get("id")}:reply`)
      .setLabel("Reply")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(
        `post:${tweetUpdated.get("id")}:viewProfile:${tweetProfile.get("handle")}`,
      )
      .setLabel("View Profile")
      .setStyle(ButtonStyle.Secondary),
  );
  const interactionChannel = _client.channels.cache.get(
    interaction.channelId,
  ) as BaseGuildTextChannel;

  const message = await interactionChannel.messages.fetch(
    tweetUpdated.get("messageId") as string,
  );

  await message.edit({ components: [newButtonRow] });
  await tweet.update({ messageId: message.id });
}

export default {
  data: commandData,
  execute,
  modalExecute,
  buttonExecute,
  selectMenuExecute,
  autocomplete,
};
