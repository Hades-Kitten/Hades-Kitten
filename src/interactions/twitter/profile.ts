import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  type Client,
  EmbedBuilder,
} from "discord.js";

import { getProfileEmbed } from "../../utils/commands/twitter/profile";
import Profile from "../../models/profile";
import autocomplete from "../../utils/handleAutocomplete";

const commandData = new SlashCommandBuilder()
  .setName("profile")
  .setDescription("Manage your social profiles")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("create")
      .setDescription("Create a new profile")
      .addStringOption((option) =>
        option
          .setName("handle")
          .setDescription("Your unique handle")
          .setRequired(true),
      )
      .addStringOption((option) =>
        option.setName("bio").setDescription("Your profile bio"),
      )
      .addStringOption((option) =>
        option
          .setName("profile_picture")
          .setDescription("URL to your profile picture"),
      )
      .addStringOption((option) =>
        option
          .setName("banner_picture")
          .setDescription("URL to your banner picture"),
      )
      .addStringOption((option) =>
        option.setName("location").setDescription("Your location"),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("delete")
      .setDescription("Delete a profile")
      .addStringOption((option) =>
        option
          .setName("handle")
          .setDescription("The handle to delete")
          .setAutocomplete(true)
          .setRequired(true),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("edit")
      .setDescription("Edit a profile")
      .addStringOption((option) =>
        option
          .setName("handle")
          .setDescription("The handle to edit")
          .setAutocomplete(true)
          .setRequired(true),
      )
      .addStringOption((option) =>
        option.setName("bio").setDescription("Your new bio"),
      )
      .addStringOption((option) =>
        option
          .setName("profile_picture")
          .setDescription("URL to your new profile picture"),
      )
      .addStringOption((option) =>
        option
          .setName("banner_picture")
          .setDescription("URL to your new banner picture"),
      )
      .addStringOption((option) =>
        option.setName("location").setDescription("Your new location"),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("view")
      .setDescription("View a profile")
      .addStringOption((option) =>
        option
          .setName("handle")
          .setDescription("The handle to view")
          .setAutocomplete(true)
          .setRequired(true),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("list")
      .setDescription("List profiles")
      .addUserOption((option) =>
        option
          .setName("user")
          .setDescription("The user whose profiles to list"),
      ),
  );

async function execute(
  _client: Client,
  interaction: ChatInputCommandInteraction,
) {
  await interaction.deferReply({ flags: ["Ephemeral"] });
  const subcommand = interaction.options.getSubcommand();

  switch (subcommand) {
    case "create": {
      const handle = interaction.options.getString("handle", true);
      const bio = interaction.options.getString("bio");
      const profilePicture = interaction.options.getString("profile_picture");
      const bannerPicture = interaction.options.getString("banner_picture");
      const location = interaction.options.getString("location");

      const existingProfile = await Profile.findOne({
        where: {
          guildId: interaction.guildId,
          handle,
        },
      });
      if (existingProfile) {
        await interaction.editReply(
          "That handle is already taken in this server!",
        );
        return;
      }

      await Profile.create({
        userId: interaction.user.id,
        guildId: interaction.guildId,
        handle,
        bio,
        profilePicture,
        bannerPicture,
        location,
      });

      const embed = new EmbedBuilder()
        .setTitle(`Created @${handle}'s Profile`)
        .setColor("Green");

      await interaction.editReply({ embeds: [embed] });
      break;
    }

    case "delete": {
      const handle = interaction.options.getString("handle", true);

      const profile = await Profile.findOne({
        where: {
          handle,
          guildId: interaction.guildId,
          userId: interaction.user.id,
        },
      });

      if (!profile) {
        await interaction.editReply("Profile not found or you don't own it!");
        return;
      }

      await profile.destroy();

      const embed = new EmbedBuilder()
        .setTitle(`Deleted @${handle}'s Profile`)
        .setColor("Red");

      await interaction.editReply({ embeds: [embed] });
      break;
    }

    case "edit": {
      const handle = interaction.options.getString("handle", true);
      const bio = interaction.options.getString("bio");
      const profilePicture = interaction.options.getString("profile_picture");
      const bannerPicture = interaction.options.getString("banner_picture");
      const location = interaction.options.getString("location");

      const profile = await Profile.findOne({
        where: {
          handle,
          userId: interaction.user.id,
          guildId: interaction.guildId,
        },
      });

      if (!profile) {
        await interaction.editReply("Profile not found or you don't own it!");
        return;
      }

      await profile.update({
        bio: bio ?? profile.get("bio"),
        profilePicture: profilePicture ?? profile.get("profilePicture"),
        bannerPicture: bannerPicture ?? profile.get("bannerPicture"),
        location: location ?? profile.get("location"),
      });

      const embed = new EmbedBuilder()
        .setTitle(`Updated @${handle}'s Profile`)
        .setColor("Blue");

      await interaction.editReply({ embeds: [embed] });
      break;
    }

    case "view": {
      const handle = interaction.options.getString("handle", true);
      const embed = await getProfileEmbed(handle);
      if (!embed) return await interaction.editReply("Profile not found!");

      await interaction.editReply({ embeds: [embed] });
      break;
    }

    case "list": {
      const user = interaction.options.getUser("user") ?? interaction.user;

      const profiles = await Profile.findAll({ where: { userId: user.id } });

      if (profiles.length === 0) {
        await interaction.editReply(`${user.username} has no profiles!`);
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(`${user.username}'s Profiles`)
        .setDescription(profiles.map((p) => `@${p.get("handle")}`).join("\n"))
        .setColor("Blue");

      await interaction.editReply({ embeds: [embed] });
      break;
    }
  }
}

export default {
  data: commandData,
  execute,
  autocomplete,
};
