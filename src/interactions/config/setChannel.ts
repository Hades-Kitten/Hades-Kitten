import {
  type ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  type Client,
  ChannelType,
  PermissionFlagsBits,
} from "discord.js";

import Region from "../../models/region";

const commandData = new SlashCommandBuilder()
  .setName("setchannel")
  .setDescription("Sets the channels that will be tracked for nationstates")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("rmb")
      .setDescription("Set the channel for regional message board updates")
      .addChannelOption((option) =>
        option
          .setName("channel")
          .setDescription("The channel for updates")
          .setRequired(true)
          .addChannelTypes(ChannelType.GuildText),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("activity")
      .setDescription("Set the channel for regional activity updates")
      .addChannelOption((option) =>
        option
          .setName("channel")
          .setDescription("The channel for updates")
          .setRequired(true)
          .addChannelTypes(ChannelType.GuildText),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("dispatches")
      .setDescription("Sets the channel for updates on new dispatches")
      .addChannelOption((option) =>
        option
          .setName("channel")
          .setDescription("The channel for updates")
          .setRequired(true)
          .addChannelTypes(ChannelType.GuildText),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("date")
      .setDescription("Sets the channel for quarterly updates")
      .addChannelOption((option) =>
        option
          .setName("channel")
          .setDescription("The channel for updates")
          .setRequired(true)
          .addChannelTypes(ChannelType.GuildVoice),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("tweets")
      .setDescription("Sets the channel where Tweets will be posted")
      .addChannelOption((option) =>
        option
          .setName("channel")
          .setDescription("The channel for updates")
          .setRequired(true)
          .addChannelTypes(ChannelType.GuildText),
      ),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

async function execute(
  _client: Client,
  interaction: ChatInputCommandInteraction,
) {
  if (interaction.channel?.type !== ChannelType.GuildText) return;
  await interaction.deferReply({ flags: ["Ephemeral"] });

  const type = interaction.options.getSubcommand();
  const channel = interaction.options.getChannel("channel", true);
  const [data] = await Region.findOrCreate({
    where: { guildId: interaction.guild?.id },
  });

  if (type === "rmb") {
    await data.update({ rmbChannelId: channel.id });
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("RMB channel set!")
      .setDescription(
        `This server is now tracking the RMB in channel: ${channel.name}`,
      );
    await interaction.editReply({ embeds: [embed] });
  }
  if (type === "activity") {
    await data.update({ activityChannelId: channel.id });
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("Activity channel set!")
      .setDescription(
        `This server is now tracking regional activity in channel: ${channel.name}`,
      );
    await interaction.editReply({ embeds: [embed] });
  }
  if (type === "dispatches") {
    await data.update({ dispatchChannelId: channel.id });
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("Dispatch channel set!")
      .setDescription(
        `This server is now tracking new dispatches in channel: ${channel.name}`,
      );
    await interaction.editReply({ embeds: [embed] });
  }
  if (type === "date") {
    await data.update({ dateChannelId: channel.id });
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("Date channel set!")
      .setDescription(
        `This server is now tracking date updates in channel: ${channel.name}`,
      );
    await interaction.editReply({ embeds: [embed] });
  }
  if (type === "tweets") {
    await data.update({ tweetChannelId: channel.id });
    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("Tweet channel set!")
      .setDescription(
        `This server is now tracking Tweets in channel: ${channel.name}`,
      );
    await interaction.editReply({ embeds: [embed] });
  }
}

export default {
  data: commandData,
  execute,
};
