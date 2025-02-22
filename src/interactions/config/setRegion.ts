import {
  ChannelType,
  type ChatInputCommandInteraction,
  type Client,
  EmbedBuilder,
  InteractionContextType,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";

import Region from "../../models/region";

const commandData = new SlashCommandBuilder()
  .setName("setregion")
  .setDescription("Set the region for this server")
  .addStringOption((option) =>
    option
      .setName("region")
      .setDescription("The nationstates region to watch")
      .setRequired(true),
  )
  .setContexts(InteractionContextType.Guild)
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

async function execute(
  _client: Client,
  interaction: ChatInputCommandInteraction,
) {
  if (interaction.channel?.type !== ChannelType.GuildText) return;
  await interaction.deferReply({ flags: ["Ephemeral"] });

  const regionName = interaction.options.getString("region", true);

  const [data] = await Region.findOrCreate({
    where: { guildId: interaction.guild?.id },
  });
  await data.update({ regionName: regionName });

  const embed = new EmbedBuilder()
    .setColor("Green")
    .setTitle("Region set!")
    .setDescription(`This server is now tracking region: ${regionName}`);
  await interaction.editReply({ embeds: [embed] });
}

export default {
  data: commandData,
  execute,
};
