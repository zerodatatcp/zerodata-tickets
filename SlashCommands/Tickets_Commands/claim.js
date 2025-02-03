const { SlashCommandBuilder } = require('@discordjs/builders')
const Discord = require('discord.js')
const Ticket = require('./../../Schemas/tickets.js')
const config = require('./../../config.json')

module.exports = {

    data: new SlashCommandBuilder()

        .setName('claim')
        .setDescription('Claimea un ticket'),

    async run(client, interaction) {

        const embed21 = new Discord.EmbedBuilder()
            .setDescription(`Solo los miembros del staff pueden utilizar este comando! <@${interaction.user.id}>`)
            .setColor(config.colorMain)

        if (!interaction.member.roles.cache.has(config.rolStaff)) return interaction.reply({ embeds: [embed21], ephemeral: true })

        const date = await Ticket.findOne({ channelId: interaction.channel.id })

        if (!date) return interaction.reply({ content: "No puedes usar este comando aquí!", ephemeral: true })

        let data = await Ticket.findOne({ channelId: interaction.channel.id })

        const canal = client.channels.cache.get(interaction.channel.id)

        const embed = await canal.messages.fetch(data.messageId)

        const usuario = await interaction.guild.members.resolve(data.userId)

        const canale = interaction.channel.id

        const embed1 = embed.embeds[0]
        embed1.fields[0].value = ` \`\`\`yaml\nEste ticket ha sido asumido por ${interaction.user.tag}\`\`\` `

        embed.edit({ embeds: [embed1] })

        const embed124 = new Discord.EmbedBuilder()
            .setAuthor({ name: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL({ dynamic: true })})
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .setDescription(`Tu ticket <#${canale}>`)
            .addFields([
                { name: "Ticket", value: `\`\`\`yaml\nEste ticket ha sido asumido por ${interaction.user.tag}\`\`\`` }
            ])
            .setColor(config.colorMain)
            .setFooter({ text: `${interaction.user.username}・${interaction.guild.name}`, iconURL: interaction.user.avatarURL({ dynamic: true })})

        const embed6 = new Discord.EmbedBuilder()
            .setDescription(`NO LE PUEDO ENVIAR MENSAJE AL PRIVADO AL USUARIO <@${data.userId}>`)
            .setColor(config.colorMain)

        let dete = await Ticket.findOne({ channelId: interaction.channel.id })

        const usuarioo = client.users.fetch(dete.userId)

        usuarioo.then(async function (userr) {

            try {
                await userr.send({ embeds: [embed124] })

            } catch {
                interaction.channel.send({ embeds: [embed6] })
                    .then(message => {
                        setTimeout(() => message.delete(), 1000)
                    })
            }
        })
        interaction.reply({ content: "Has asumido el ticket", ephemeral: true })


    }
}