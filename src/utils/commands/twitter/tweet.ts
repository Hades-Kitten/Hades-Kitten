import type { Message, ModalSubmitInteraction, User } from "discord.js";
import {
  EmbedBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ButtonBuilder,
} from "discord.js";
import type { Model } from "sequelize";

import Profile from "../../../models/profile";
import Region from "../../../models/region";
import Tweet from "../../../models/tweet";

import type { PostInstance } from "../../../types";

interface PostInput {
  handle: string;
  content: string;
  replyTo?: string;
}

async function errorMessage(
  interaction: ModalSubmitInteraction,
  message: string,
) {
  await interaction.reply({
    content: message,
    flags: ["Ephemeral"],
  });
}

function parseContent(content: string) {
  let parsedContent = content;
  const mentions = content.matchAll(/@([a-zA-Z0-9_]+)/g);
  const mentionedUsers: string[] = [];

  if (mentions) {
    for (const mention of mentions) {
      const username = mention[1];
      if (username) {
        mentionedUsers.push(username);
        parsedContent = parsedContent.replace(
          `@${username}`,
          `**@${username}**`,
        );
      }
    }
  }

  return { parsedContent, mentionedUsers };
}

async function constructEmbed(
  post: PostInstance,
  profile: Model,
  replyToId?: string,
  replyToMessageUrl?: string,
) {
  const content = post.get("content") as string;

  let replyHandle: string | null = null;
  if (replyToId) {
    const tweetProfile = await Profile.findOne({
      where: { id: replyToId },
    });

    if (tweetProfile) replyHandle = tweetProfile.get("handle") as string;
  }

  const embed = new EmbedBuilder()
    .setAuthor({
      name: `@${profile.get("handle")}`,
      iconURL: (profile.get("profilePicture") as string) ?? undefined,
    })
    .setDescription(
      replyHandle && replyToMessageUrl
        ? `**[Replying to @${replyHandle}](${replyToMessageUrl})** ${content}`
        : content,
    )
    .setTimestamp(post.get("timestamp") as unknown as Date)
    .setColor("Blue");

  return embed;
}

function constructButtonRow(postId: string, handle: string) {
  const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`post:${postId}:like`)
      .setLabel("0")
      .setEmoji("❤️")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`post:${postId}:reply`)
      .setLabel("Reply")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId(`post:${postId}:viewProfile:${handle}`)
      .setLabel("View Profile")
      .setStyle(ButtonStyle.Secondary),
  );

  return buttonRow;
}

async function newPost(interaction: ModalSubmitInteraction, post: PostInput) {
  if (!interaction.guildId)
    return errorMessage(
      interaction,
      "You must be in a server to post on Twatter",
    );
  const { handle, content, replyTo } = post;
  if (!handle) throw new Error("No handle provided");
  if (!content) throw new Error("No content provided");

  const posterProfile = await Profile.findOne({
    where: { handle, userId: interaction.user.id },
  });
  if (!posterProfile)
    return errorMessage(
      interaction,
      "You don't have a profile with that handle",
    );

  const region = await Region.findOne({
    where: { guildId: interaction.guildId },
  });
  if (!region)
    return errorMessage(
      interaction,
      "This server doesn't have a region set up",
    );

  if (!region.get("tweetChannelId"))
    return errorMessage(
      interaction,
      "This server doesn't have a tweet channel set up",
    );

  const tweetChannel = interaction.guild?.channels.cache.get(
    region.get("tweetChannelId") as string,
  );
  if (!tweetChannel || !tweetChannel.isSendable())
    return errorMessage(
      interaction,
      "Either the post channel is missing or I can't send messages there",
    );

  let replyToMessage: Message | null = null;
  let replyToPost: PostInstance | null = null;
  let replyToProfile: Model | null = null;
  if (replyTo) {
    replyToPost = (await Tweet.findOne({
      where: { id: replyTo },
    })) as PostInstance;
    if (!replyToPost)
      return errorMessage(
        interaction,
        "I couldn't find the post you're replying to",
      );

    replyToMessage = await tweetChannel.messages.fetch(
      replyToPost.get("messageId") as string,
    );
    if (!replyToMessage)
      return errorMessage(
        interaction,
        "I couldn't find the psot you're replying to",
      );

    replyToProfile = await Profile.findOne({
      where: { id: replyToPost.get("profileId") },
    });
  }

  const { parsedContent, mentionedUsers } = parseContent(content);

  const newPost = await Tweet.create({
    profileId: posterProfile.get("id"),
    ...(replyToPost && { replyToTweetId: replyToPost.get("id") }),
    content: parsedContent,
  });

  const embed = await constructEmbed(
    newPost as PostInstance,
    posterProfile,
    replyToProfile?.get("id") as string,
    replyToMessage?.url,
  );

  const buttonRow = constructButtonRow(newPost.get("id") as string, handle);

  let message: Message | null = null;
  const messageBody = {
    embeds: [embed],
    components: [buttonRow],
  };

  if (replyToMessage) message = await replyToMessage.reply(messageBody);
  else message = await tweetChannel.send(messageBody);

  await newPost.update({ messageId: message.id });
  await interaction.reply({
    content: `Posted! ${message.url}`,
    flags: ["Ephemeral"],
  });

  const mentionedProfiles = await Profile.findAll({
    where: { handle: mentionedUsers, guildId: interaction.guildId },
  });

  for (const mentionedProfile of mentionedProfiles) {
    const user = await interaction.client.users.fetch(
      mentionedProfile.get("userId") as string,
    );
    await user.send({
      content: `You were mentioned in a post by **@${handle}** in **${region.get("regionName") as string}**`,
      embeds: [embed],
    });
  }
}

export default newPost;
