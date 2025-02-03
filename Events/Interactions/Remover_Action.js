const { EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
  customId: 'remover',
  async execute(client, interaction) {
    await interaction.deferUpdate();

    const embed2 = new EmbedBuilder()
      .setDescription(`Solo los miembros del staff pueden utilizar este comando! <@${interaction.user.id}>`)
      .setColor(config.colorMain);

    if (!interaction.member.roles.cache.has(config.rolStaff)) return interaction.channel.send({ embeds: [embed2] });

    const emebd3 = new EmbedBuilder()
      .setDescription("Mencione a alguien para sacarlo del **TICKET**")
      .setColor(config.colorMain);

    const mens = await interaction.channel.send({ embeds: [emebd3] });

    const filter = (m) => m.author.id === interaction.user.id && m.mentions.members.first();

    const collector = interaction.channel.createMessageCollector({
      filter: filter,
      time: 10000,
      max: 1
    });

    collector.on('collect', (me) => {
      mens.delete();
    });

    collector.on('end', async collected => {
      if (collected.size === 0) {
        mens.delete();

        const emebed = new EmbedBuilder()
          .setDescription("No mencionaste a nadie!")
          .setColor(config.colorMain);

        interaction.channel.send({ embeds: [emebed] });
      }

      collected.forEach((message) => {
        trg = `${message.content}`;

        interaction.channel.permissionOverwrites.edit(message.mentions.users.first().id, {
          ViewChannel: false
        });

        const embed4 = new EmbedBuilder()
          .setDescription(`<@${message.mentions.users.first().id}>, **ha sido removido** del ticket con éxito.`)
          .setColor(config.colorMain);

        interaction.channel.send({ embeds: [embed4] });
      });
    });
  },
};