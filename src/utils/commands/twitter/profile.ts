import { EmbedBuilder } from "discord.js";
import Profile from "../../../models/profile";

async function getProfileEmbed(handle: string) {
  const profile = await Profile.findOne({ where: { handle } });
  if (!profile) return null;

  const followers = (profile.get("followers") as string[]).length;
  const following = (profile.get("following") as string[]).length;

  const embed = new EmbedBuilder()
    .setTitle(`@${handle}'s Profile`)
    .setDescription((profile.get("bio") as string) ?? "No bio set")
    .addFields(
      {
        name: "Location",
        value: (profile.get("location") as string) ?? "Not set",
        inline: true,
      },
      { name: "Followers", value: followers.toString(), inline: true },
      { name: "Following", value: following.toString(), inline: true },
    )
    .setColor("Blue");

  if (profile.get("profilePicture"))
    embed.setThumbnail(profile.get("profilePicture") as string);
  if (profile.get("bannerPicture"))
    embed.setImage(profile.get("bannerPicture") as string);

  return embed;
}

export { getProfileEmbed };
