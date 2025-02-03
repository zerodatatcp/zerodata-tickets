const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const config = require('../../config.json');
const Ticket = require("../../Schemas/tickets.js");

module.exports = {
  customId: 'reabrir',
  async execute(client, interaction) {
    const embed2 = new EmbedBuilder()
      .setDescription(`Solo los miembros del staff pueden utilizar este comando! <@${interaction.user.id}>`)
      .setColor(config.colorMain);

    if (!interaction.member.roles.cache.has(config.rolStaff)) return interaction.channel.send({ embeds: [embed2] });

    const data = await Ticket.findOne({ channelId: interaction.channel.id });

    interaction.channel.permissionOverwrites.edit(data.userId, {
      ViewChannel: true
    });

    const canal = client.channels.cache.get(interaction.channel.id);
    const embed = await canal.messages.fetch(data.messageId);

    const embed1 = embed.embeds[0];
    embed1.fields[1].value = ` \`\`\`brainfuck\nEl ticket se encuentra abierto\`\`\` `;

    embed.edit({ embeds: [embed1] });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setStyle("Link")
          .setLabel("Servidor")
          .setEmoji(`<:icons_Link:859388126875484180>`)
          .setURL(`https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}`),
      );

    const embedRe = new EmbedBuilder()
      .setDescription(`El ticket ha sido reabierto con éxito!`)
      .setColor(config.colorMain);

    const embed91 = new EmbedBuilder()
      .setTitle("Tu ticket ha sido re abierto!")
      .setDescription(`El ticket <#${interaction.channel.id}> ha sido re abierto en el servidor ${interaction.guild.name}. Pulsa el botón de abajo y hecha un vistazo!`)
      .setColor(config.colorMain)
      .addFields(
        { name: "Autor", value: `\`\`\`fix\n${interaction.user.tag}\`\`\`` }
      )
      .setFooter({ text: `Sistema de tickets de ${interaction.guild.name}`, iconURL: interaction.guild.iconURL({ dynamic: true }) });

    const usuario = interaction.guild.members.resolve(data.userId);

    usuario.send({ embeds: [embed91], components: [row] }).catch(() => console.log(null));

    interaction.reply({ embeds: [embedRe] });
  },
};