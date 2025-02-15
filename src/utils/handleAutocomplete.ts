import type { AutocompleteInteraction } from "discord.js";
import type { Model } from "sequelize";
import type { Profile as ProfileType } from "../types";
import Profile from "./../models/profile";

interface ProfileInstance extends Model<ProfileType>, ProfileType {}

async function autocomplete(interaction: AutocompleteInteraction) {
  if (!interaction.guild) return;
  const focusedOption = interaction.options.getFocused(true);
  let subcommand: string | undefined;
  const choices = [];

  try {
    subcommand = interaction.options.getSubcommand();
  } catch (_error) {}

  if (focusedOption.name === "handle") {
    let profiles: ProfileInstance[];

    if (subcommand === "view") {
      profiles = (await Profile.findAll({
        where: { guildId: interaction.guild.id },
      })) as ProfileInstance[];
    } else {
      profiles = (await Profile.findAll({
        where: { userId: interaction.user.id, guildId: interaction.guild.id },
      })) as ProfileInstance[];
    }

    for (let i = 0; i < profiles.length; i++) {
      const profile = profiles[i];
      if (profile.get("handle").startsWith(focusedOption.value)) {
        choices.push({
          name: profile.get("handle") as string,
          value: profile.get("handle") as string,
        });
      }
    }
  }
  await interaction.respond(choices.slice(0, 25));
}

export default autocomplete;
