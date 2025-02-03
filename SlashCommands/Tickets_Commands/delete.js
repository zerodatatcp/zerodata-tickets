const { SlashCommandBuilder } = require('@discordjs/builders')
const Discord = require('discord.js')
const config = require('./../../config.json')
module.exports = {

    data: new SlashCommandBuilder()

        .setName('delete_ticket')
        .setDescription('Borra un ticket'),

    async run(client, interaction) {

        const embed21 = new Discord.EmbedBuilder()
            .setDescription(`Solo los miembros del staff pueden utilizar este comando! <@${interaction.user.id}>`)
            .setColor(config.colorMain)

        if (!interaction.member.roles.cache.has(config.rolStaff)) return interaction.reply({ embeds: [embed21], ephemeral: true })

        const date = await Ticket.findOne({ channelId: interaction.channel.id })

        if (!date) return interaction.reply({ content: "No puedes usar este comando aquí!", ephemeral: true })

        const modal = new Discord.ModalBuilder()
            .setTitle("Razón")
            .setCustomId("razon_ticket")

        const razone = new Discord.TextInputBuilder()
            .setCustomId("razon_text")
            .setLabel("Pon la razón")
            .setValue('No hay razón')
            .setPlaceholder("Escribe la razón del cierre del ticket")
            .setStyle("Short")
            .setRequired(true)

        const row = new Discord.ActionRowBuilder()
            .addComponents(razone);

        modal.addComponents(row)

        await interaction.showModal(modal)

    }
}