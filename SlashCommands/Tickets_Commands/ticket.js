const { SlashCommandBuilder } = require('@discordjs/builders')
const Discord = require('discord.js')
const config = require('../../config.json')

module.exports = {

    data: new SlashCommandBuilder()

        .setName('ticket')
        .setDescription('Manda el panel del ticket'),

    async run(client, interaction) {

        if (config.rolStaff !== 'none' && !interaction.member.roles.cache.has(config.rolStaff)) return interaction.reply({ content: "No tienes permisos para usar este comando.", ephemeral: true })

        interaction.reply({ content: "Panel de ticket enviado!", ephemeral: true })

        const actionRow = new Discord.ActionRowBuilder()
        const selectMenuOptions = []

        for (const [ticketName, ticketData] of Object.entries(config.tickets)) {
            const option = {
                label: ticketName.charAt(0).toUpperCase() + ticketName.slice(1),
                description: `Ticket relacionado con ${ticketName.replace('_', ' ')}.`,
                emoji: ticketData.emoji_dropdown,
                value: ticketName
            };
            selectMenuOptions.push(option)
        }

        const selectMenu = new Discord.StringSelectMenuBuilder()
            .setCustomId("tickets")
            .setPlaceholder('Seleccione una categoría')
            .addOptions(selectMenuOptions)

        actionRow.addComponents(selectMenu)

        const embed2 = new Discord.EmbedBuilder()
        .setTitle('Sistema de tickets')
        .setDescription(`> Bienvenido al **sistema de tickets**! Aquí podrás abrir un canal privado para contactar directamente con nuestra plantilla de staff. \n\n> Para abrir un ticket, selecciona una categoría de la lista desplegable.`)
        .setColor(config.colorMain)
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setFooter({ text: `Sistema de tickets de ${interaction.guild.name}`, iconURL: interaction.guild.iconURL({ dynamic: true })});

        if (config.imagenPanel !== 'none') {
        embed2.setImage(config.imagenPanel);
        }

        await interaction.channel.send({ embeds: [embed2], components: [actionRow] });
       
    }
} 