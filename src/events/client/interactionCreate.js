//Imports
const discord = require("discord.js");
//Interaction Create event
module.exports = {
    name: "interactionCreate",
    async execute(interaction, client) {
        //Application Commands
        if (interaction.isChatInputCommand()) {
            const { commands } = client;
            const { commandName } = interaction;
            const command = commands.get(commandName);
            if (!command)
                return;
            try {
                await command.execute(interaction, client);
            }
            catch (error) {
                await interaction.deferReply({ ephemeral: true });
                const row = new discord.ActionRowBuilder().addComponents(new discord.ButtonBuilder()
                    .setCustomId("solutions")
                    .setLabel("Solutions?")
                    .setStyle(discord.ButtonStyle.Success));
                const commandErrorEmbed = new discord.EmbedBuilder()
                    .setColor("Red")
                    .setDescription(`***:warning: Something went wrong while executing this command***`);
                await interaction.followUp({
                    components: [row],
                    embeds: [commandErrorEmbed],
                    ephemeral: true,
                });
                console.log(error);
                const channel = client.channels.cache.get("1247902246759567453");
                const embed = new discord.EmbedBuilder()
                    .setColor("Red")
                    .setTitle(error.name)
                    .addFields([
                    { name: "Command", value: `/${commandName}` },
                    { name: "Guild", value: `${interaction.guild.name}` },
                ])
                    .setDescription(`\`\`\`${error.stack}\`\`\``);
                return await channel.send({ embeds: [embed] });
            }
        }
        //Buttons
        else if (interaction.isButton()) {
            const { buttons } = client;
            const { customId } = interaction;
            const button = buttons.get(customId);
            if (!button)
                return new Error("There is no code for this button");
            try {
                await button.execute(interaction, client);
            }
            catch (err) {
                console.log(err);
            }
        }
        //Context menus
        else if (interaction.isContextMenuCommand()) {
            const { commands } = client;
            const { commandName } = interaction;
            const contextCommand = commands.get(commandName);
            if (!contextCommand)
                return;
            try {
                await contextCommand.execute(interaction, client);
            }
            catch (error) {
                console.error(error);
                const commandErrorEmbed = new discord.EmbedBuilder()
                    .setColor(`Red`)
                    .setDescription("***:warning: Something went wrong while executing this context menu***");
                await interaction.reply({
                    embeds: [commandErrorEmbed],
                    ephemeral: true,
                });
            }
        }
    },
};
