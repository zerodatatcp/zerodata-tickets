const { SlashCommandBuilder } = require('@discordjs/builders')
const Discord = require('discord.js')
const Ticket = require('./../../Schemas/tickets.js')
const config = require('./../../config.json')

module.exports = {

    data: new SlashCommandBuilder()

        .setName('reopen')
        .setDescription('Re abre un ticket'),

    async run(client, interaction) {

        const embed2 = new Discord.EmbedBuilder()
            .setDescription(`Solo los miembros del staff pueden utilizar este comando! <@${interaction.user.id}>`)
            .setColor(config.colorMain)

        if (!interaction.member.roles.cache.has(config.rolStaff) && !interaction.member.permissions.has('ADMINISTRATOR')) return interaction.reply({ embeds: [embed2], ephemeral: true })

        const date = await Ticket.findOne({ channelId: interaction.channel.id })

        if (!date) return interaction.reply({ content: "No puedes usar este comando aquí!", ephemeral: true })

        let dete = await Ticket.findOne({ channelId: interaction.channel.id })

        const usuarioo = client.users.fetch(dete.userId)

        const data = await Ticket.findOne({ channelId: interaction.channel.id })

        usuarioo.then(function (userr) {

            interaction.channel.permissionOverwrites.edit(userr, {

                VIEW_CHANNEL: true

            });
        })

        const canal = client.channels.cache.get(interaction.channel.id)

        const embed = await canal.messages.fetch(data.messageId)

        const embed1 = embed.embeds[0]
        embed1.fields[1].value = ` \`\`\`brainfuck\nEl ticket se encunetra abierto\`\`\` `

        embed.edit({ embeds: [embed1] })

        const row = new Discord.ActionRowBuilder()
            .addComponents(

                new Discord.ButtonBuilder()

                    .setStyle("Link")
                    .setLabel("Servidor")
                    .setEmoji(`<:icons_link:859388126875484180>`)
                    .setURL(`https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}`),


            )

        const embedRe = new Discord.EmbedBuilder()
            .setDescription(`El ticket ha sido reabierto con éxito!`)
            .setColor(config.colorMain)

        const embed91 = new Discord.EmbedBuilder()
            .setTitle("Tu ticket ha sido re abierto!")
            .setDescription(`El ticket <#${interaction.channel.id}> ha sido re abierto en el servidor ${interaction.guild.name}. Pulsa el botón de abajo y hecha un vistazo!`)
            .setColor(config.colorMain)
            .addFields(
                { name: "Autor", value: `\`\`\`fix\n${interaction.user.tag}\`\`\`` }
            )
            .setFooter({ text: `Sistema de tickets・${interaction.guild.name}`, iconURL: interaction.guild.iconURL({ dynamic: true }) })

        const embed6 = new Discord.EmbedBuilder()
            .setDescription(`No se le puede enviar el mensaje a <@${data.userId}>`)
            .setColor(config.colorMain)

        usuarioo.then(async function (userr) {

            try {
                await userr.send({ embeds: [embed91], components: [row] })

            } catch {
                interaction.channel.send({ embeds: [embed6] })
                    .then(message => {
                        setTimeout(() => message.delete(), 1000)
                    })
            }
        })

        interaction.reply({ embeds: [embedRe], ephemeral: true })


    }

}