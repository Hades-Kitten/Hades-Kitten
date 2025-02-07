import {
    type ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
    type Client,
    type ButtonInteraction,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    type ModalSubmitInteraction,
    PermissionFlagsBits,
    InteractionContextType,
} from "discord.js";

import xmlToJson from "../utils/xmlToJson";
import Verify from "../models/verify";
import type { VerifyData } from "../types";
import verify_role from "../models/verifyRole";

const commandData = new SlashCommandBuilder()
    .setName("verify_role")
    .setDescription("The role that will be given to verified users")
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addRoleOption((option) =>
        option
            .setName("role")
            .setDescription("The bot assigns a role to verified users. To remove it, select the assigned role.")
            .setRequired(true),
    );

async function execute(
    _client: Client,
    interaction: ChatInputCommandInteraction,
) {
    const role = interaction.options.getRole("role")
    const data = await verify_role.findOne({ where: { guildId: interaction.guild?.id, roleId: role?.id }})

    if(!data || role?.id !== (data as any).roleId) {
        await verify_role.create({ guildId: interaction.guild?.id, roleId: role?.id })

        return await interaction.reply({ embeds: [
            new EmbedBuilder()
                .setTitle("Successellly changed the role!")
                .setDescription(`"${role?.name}" is now the role that will be given to users who verify!`)
                .setColor("Green")
        ]})
    } 
    if(data && role?.id === (data as any).roleId) {
        await verify_role.destroy({ where: { guildId: interaction.guild?.id }})

        return await interaction.reply({ embeds: [
            new EmbedBuilder()
            .setTitle("Successslly changed the role!")
            .setDescription("The role given to verified users has now been removed.")
            .setColor("Green")
        ]})
    }
}

export default {
    data: commandData,
    execute
  };