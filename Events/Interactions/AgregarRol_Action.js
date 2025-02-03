const { EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
  customId: 'agregar_rol',
  async execute(client, interaction) {
    await interaction.deferUpdate();

    const embed22 = new EmbedBuilder()
      .setDescription(`Solo los miembros del staff pueden utilizar este comando! <@${interaction.user.id}>`)
      .setColor(config.colorMain);

    if (!interaction.member.roles.cache.has(`${config.rolStaff}`)) return interaction.channel.send({ embeds: [embed22] });

    const emebd2 = new EmbedBuilder()
      .setDescription("Mencione un rol para añadirlo al **TICKET**")
      .setColor(config.colorMain);

    const mens = await interaction.channel.send({ embeds: [emebd2] });

    const filter = (m) => m.author.id === interaction.user.id && m.mentions.roles.first();

    const collector = interaction.channel.createMessageCollector({
      filter: filter,
      time: 10000,
      max: 1
    });

    collector.on('collect', async (me) => {
      mens.delete();
    });

    collector.on('end', async collected => {
      if (collected.size === 0) {
        mens.delete();

        const emebed = new EmbedBuilder()
          .setDescription("No mencionaste ningun rol!")
          .setColor(config.colorMain);

        interaction.channel.send({ embeds: [emebed] });
        return;
      }

      collected.forEach((message) => {
        trg = `${message.content}`;

        interaction.channel.permissionOverwrites.edit(message.mentions.roles.first().id, {
          ViewChannel: true
        });

        const embed5 = new EmbedBuilder()
          .setDescription(`<@&${message.mentions.roles.first().id}>, **ha sido agregado** del ticket con éxito.`)
          .setColor(config.colorMain);

        interaction.channel.send({ embeds: [embed5] });
      });
    });
  },
};