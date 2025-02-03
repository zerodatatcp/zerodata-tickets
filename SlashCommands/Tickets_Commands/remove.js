const { SlashCommandBuilder } = require('@discordjs/builders')
const Discord = require('discord.js')
const Ticket = require('./../../Schemas/tickets.js')
const config = require('./../../config.json')

module.exports = {

    data: new SlashCommandBuilder()

        .setName('remove')
        .setDescription('remover a un usuario o un rol al ticket.')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription("El usuario para remover del ticket.")
        )
        .addRoleOption(option =>
            option
                .setName('rol')
                .setDescription("El rol para remover del ticket.")),

    async run(client, interaction) {

        const usuario = interaction.options.getMember('usuario')
        const rol = interaction.options.getRole('rol')

        if (usuario) {
            if (usuario === null) return interaction.reply({ content: "Este usuario no esta en el discord", ephemeral: true })
            const embed3 = new Discord.EmbedBuilder()
                .setDescription(`Solo los miembros del staff pueden utilizar este comando! <@${interaction.user.id}>`)
                .setColor(config.colorMain)

            if (!interaction.member.roles.cache.has(config.rolStaff) && !interaction.member.permissions.has('ADMINISTRATOR')) return interaction.reply({ embeds: [embed3], ephemeral: true })

            const date = await Ticket.findOne({ channelId: interaction.channel.id })

            if (!date) return interaction.reply({ content: "No puedes usar este comando aquí!", ephemeral: true })

            interaction.channel.permissionOverwrites.edit(usuario.id, {

                ViewChannel: false

            }).catch(() => null);

            const embed6 = new Discord.EmbedBuilder()
                .setDescription(`<@${usuario.id}>, **ha sido removido** del ticket con éxito.`)
                .setColor(config.colorMain)

            interaction.reply({ embeds: [embed6], ephemeral: true })
        }

        if (rol) {

            const embed2 = new Discord.EmbedBuilder()
                .setDescription(`Solo los miembros del staff pueden utilizar este comando! <@${interaction.user.id}>`)
                .setColor(config.colorMain)

            if (!interaction.member.roles.cache.has(config.rolStaff) && !interaction.member.permissions.has('ADMINISTRATOR')) return message.channel.send({ embeds: [embed2] })

            interaction.channel.permissionOverwrites.edit(rol.id, {

                ViewChannel: false

            }).catch(() => null);

            const embed5 = new Discord.EmbedBuilder()
                .setDescription(`<@&${rol.id}>, **ha sido removido** del ticket con éxito.`)
                .setColor(config.colorMain)

            interaction.reply({ embeds: [embed5], ephemeral: true })
        }

    }
}