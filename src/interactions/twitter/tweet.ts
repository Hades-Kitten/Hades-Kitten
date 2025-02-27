import fs from "fs";
import crypto from "node:crypto";
import path from "node:path";
import {
  ActionRowBuilder,
  type BaseGuildTextChannel,
  ButtonBuilder,
  type ButtonInteraction,
  ButtonStyle,
  type ChatInputCommandInteraction,
  type Client,
  InteractionContextType,
  type Message,
  ModalBuilder,
  type ModalSubmitInteraction,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  type StringSelectMenuInteraction,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

import type { PostInstance } from "../../types";
import { constructEmbed } from "../../utils/commands/twitter/tweet";

import Profile from "../../models/profile";
import Region from "../../models/region";
import Tweet from "../../models/tweet";

import newPost from "../../utils/commands/twitter/tweet";

import { getProfileEmbed } from "../../utils/commands/twitter/profile";
import autocomplete from "../../utils/handleAutocomplete";

function generateRandomString(length: number): string {
  return crypto.randomBytes(length).toString("hex").slice(0, length);
}

const commandData = new SlashCommandBuilder()
  .setName("post")
  .setDescription("Create a new post")
  .setContexts(InteractionContextType.Guild)
  .addStringOption((option) =>
    option
      .setName("handle")
      .setDescription("The handle to post from")
      .setAutocomplete(true)
      .setRequired(true),
  )
  .addAttachmentOption((option) =>
    option.setName("image").setDescription("An image to go with your post"),
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

  const attachment = interaction.options.getAttachment("image");

  let imagePath: string | undefined;

  if (attachment) {
    const randomName = generateRandomString(8);
    const fileExtension = path.extname(attachment.name);
    imagePath = path.join("tmp", `${randomName}${fileExtension}`);

    if (!fs.existsSync("tmp")) fs.mkdirSync("tmp");
    const response = await fetch(attachment.url);
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(imagePath, Buffer.from(buffer));
  }

  const modalId = `post:${handle}:modal`;
  const lastPart = imagePath ? `:${imagePath}` : "";

  const modal = new ModalBuilder()
    .setCustomId(`${modalId}${lastPart}`)
    .setTitle("Create Post");

  const tweetInput = new TextInputBuilder()
    .setCustomId("tweetContent")
    .setLabel("What's on your mind?")
    .setStyle(TextInputStyle.Paragraph)
    .setMaxLength(2148)
    .setRequired(true);

  const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
    tweetInput,
  );

  modal.addComponents(firstActionRow);
  await interaction.showModal(modal);
}

async function modalExecute(
  _client: Client,
  interaction: ModalSubmitInteraction,
) {
  const [_command, handle, ...rest] = interaction.customId.split(":");

  switch (rest[0]) {
    case "modal": {
      const content = interaction.fields.getTextInputValue("tweetContent");
      const imagePath = rest[1];

      await newPost(interaction, {
        handle,
        content,
        imagePath,
      });

      if (imagePath && fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
      break;
    }
    case "reply": {
      if (!interaction.channelId) return;
      const tweetId = rest[1];
      const content = interaction.fields.getTextInputValue("replyContent");
      const imageUrl = interaction.fields.getTextInputValue("imageUrl");

      const tweet = await Tweet.findOne({ where: { id: tweetId } });
      if (!tweet)
        return await interaction.reply({
          content: "Tweet not found!",
          flags: ["Ephemeral"],
        });

      let imagePath: string | undefined;

      if (imageUrl) {
        const randomName = generateRandomString(8);
        imagePath = path.join("tmp", `${randomName}.png`);

        if (!fs.existsSync("tmp")) fs.mkdirSync("tmp");
        const response = await fetch(imageUrl);
        const buffer = await response.arrayBuffer();
        fs.writeFileSync(imagePath, Buffer.from(buffer));
      }

      await newPost(interaction, {
        handle,
        content,
        replyTo: tweet.get("id") as string,
        imagePath,
      });

      if (imagePath && fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
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

    case "showMore": {
      const tweet = await Tweet.findOne({ where: { id: tweetId } });
      if (!tweet) {
        await interaction.reply({
          content: "Tweet not found!",
          flags: ["Ephemeral"],
        });
        return;
      }

      const profile = await Profile.findOne({
        where: { id: tweet.get("profileId") },
      });
      if (!profile) {
        await interaction.reply({
          content: "Profile not found!",
          flags: ["Ephemeral"],
        });
        return;
      }

      const content = tweet.get("content") as string;
      const fullEmbed = await constructEmbed(
        tweet as PostInstance,
        profile,
        tweet.get("replyToTweetId") as string | undefined,
        undefined,
        undefined,
        true,
      );

      await interaction.reply({
        embeds: [fullEmbed],
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

    const imageInput = new TextInputBuilder()
      .setCustomId("imageUrl")
      .setLabel("Image URL")
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    const firstActionRow =
      new ActionRowBuilder<TextInputBuilder>().addComponents(replyInput);
    const secondActionRow =
      new ActionRowBuilder<TextInputBuilder>().addComponents(imageInput);

    modal.addComponents(firstActionRow, secondActionRow);
    await interaction.showModal(modal);
  } else if (rest[0] === "pickLikeProfile") {
    const handle = interaction.values[0];
    const tweet = await Tweet.findOne({ where: { id: tweetId } });
    const region = await Region.findOne({
      where: { guildId: interaction.guildId },
    });

    if (!tweet || !region) {
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
    let isLiking = false;

    if (likes.includes(profileId)) {
      tweet.set(
        "likes",
        likes.filter((id) => id !== profileId),
      );
    } else {
      isLiking = true;
      tweet.set("likes", [...likes, profileId]);
    }

    await interaction.deferUpdate();
    await tweet.save();

    const tweetProfile = await Profile.findOne({
      where: { id: tweet.get("profileId") },
    });
    if (!tweetProfile) return;

    if (tweetProfile.get("likeNotificationsEnabled") && isLiking) {
      const user = await _client.users.fetch(
        tweetProfile.get("userId") as string,
      );

      const messageId = await tweet.get("messageId");
      if (!messageId) return;
      const message = (await interaction.channel?.messages.fetch(
        messageId,
      )) as unknown as Message;
      if (!message || !message.embeds.length) return;

      await user.send({
        content: `**@${profile.get("handle")}** liked your post in **${region.get(
          "regionName",
        )}** - ${message.url}`,
        embeds: [message.embeds[0]],
      });
    }
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

  const content = tweetUpdated.get("content") as string;
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

  if (content.length > 280) {
    newButtonRow.addComponents(
      new ButtonBuilder()
        .setCustomId(`post:${tweetUpdated.get("id")}:showMore`)
        .setLabel("Show More")
        .setStyle(ButtonStyle.Secondary),
    );
  }

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
