const { EmbedBuilder } = require('discord.js');
const config = require('../../config.json');
const Ticket = require("../../Schemas/tickets.js");
const Asumidos = require('../../Schemas/asumidos.js');

module.exports = {
  customId: 'asumir',
  async execute(client, interaction) {
    let data = await Ticket.findOne({ channelId: interaction.channel.id });
    await data.updateOne({ asumido: true });

    const data_asumidos = await Asumidos.findOne({ staffId: interaction.member.id });
    const canal = client.channels.cache.get(interaction.channel.id);
    const embed = await canal.messages.fetch(data.messageId);
    const usuario = interaction.guild.members.resolve(data.userId);
    const canale = interaction.channel.id;

    await interaction.deferUpdate();

    const embed2 = new EmbedBuilder()
      .setDescription(`Solo los miembros del staff pueden utilizar este comando! <@${interaction.user.id}>`)
      .setColor(config.colorMain);

    if (!interaction.member.roles.cache.has(config.rolStaff)) return interaction.channel.send({ embeds: [embed2] });

    const embed1 = embed.embeds[0];
    embed1.fields[0].value = ` \`\`\`yaml\nEste ticket ha sido asumido por ${interaction.user.tag}\`\`\` `;

    if (data.asumido) return interaction.followUp({ content: "Este ticket ya ha sido asumido!", ephemeral: true });

    embed.edit({ embeds: [embed1] });

    const embed124 = new EmbedBuilder()
      .setAuthor({ name: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL({ dynamic: true }) })
      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
      .setDescription(`Tu ticket <#${canale}>`)
      .addFields([
        { name: "Ticket", value: `\`\`\`yaml\nEste ticket ha sido asumido por ${interaction.user.tag}\`\`\`` }
      ])
      .setColor(config.colorMain)
      .setFooter({ text: `${interaction.user.username}・${interaction.guild.name}`, iconURL: interaction.user.avatarURL({ dynamic: true }) });

    if (data_asumidos) {
      await data_asumidos.updateOne({ $inc: { cantidad: 1 } });
      interaction.member.send(`(**${data_asumidos.cantidad}**) | Se te ha agregado 1 punto por asumir el ticket <#${interaction.channel.id}>!\n> Para más información sobre el puntaje, habla con un superior.`);
    } else {
      await new Asumidos({ staffId: interaction.member.id, cantidad: 0 }).save();
    }

    await usuario.send({ embeds: [embed124] });
  },
};