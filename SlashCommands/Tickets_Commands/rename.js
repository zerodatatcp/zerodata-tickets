const { SlashCommandBuilder } = require('@discordjs/builders')
const Discord = require('discord.js')
const config = require('../../config.json')
const Ticket = require('../../Schemas/tickets.js')


module.exports = {

    data: new SlashCommandBuilder()

        .setName('rename')
        .setDescription('Cambiale el nombre al canal.')
        .addStringOption(option => option
            .setName('nombre')
            .setDescription('Pon el nombre del canal.')
            .setRequired(true)),

    async run(client, interaction) {


        const embed21 = new Discord.EmbedBuilder()
            .setDescription(`Solo los miembros del staff pueden utilizar este comando! <@${interaction.user.id}>`)
            .setColor(config.colorMain)

        if (!interaction.member.roles.cache.has(config.rolStaff) && !interaction.member.permissions.has('ADMINISTRATOR')) return interaction.reply({ embeds: [embed21], ephemeral: true })

        const nombre = interaction.options.getString('nombre')

        const date = await Ticket.findOne({ channelId: interaction.channel.id })

        if (!date) return interaction.reply({ content: "No puedes usar este comando aquí!", ephemeral: true })


        interaction.channel.setName(`✨・${nombre}`)

        const embed42 = new Discord.EmbedBuilder()
            .setDescription(`El canal ha sido **cambiado de nombre** exitosamente a ${nombre}!`)
            .setColor(config.colorMain)

        interaction.reply({ embeds: [embed42], ephemeral: true })


    }
}