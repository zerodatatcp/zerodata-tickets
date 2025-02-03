const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const config = require('../../config.json');
const discordTranscripts = require('discord-html-transcripts');

module.exports = {
  customId: 'transcript',
  async execute(client, interaction) {
    await interaction.deferReply();

    const embed2 = new EmbedBuilder()
      .setDescription(`<:staff:1324749168434221099> | Solo los miembros del staff pueden utilizar este comando! <@${interaction.user.id}>`)
      .setColor(config.colorMain);

    if (!interaction.member.roles.cache.has(config.rolStaff)) return interaction.channel.send({ embeds: [embed2] });

    const canal_logs = interaction.guild.channels.cache.get(config.transcript_logs);

    const channel = interaction.channel;
    const attachment = await discordTranscripts.createTranscript(channel, {
      fileName: `transcript_${interaction.channel.name}.html`
    });

    canal_logs.send({
      files: [attachment]
    }).then((a) => setTimeout(async () => {
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setStyle("Link")
            .setLabel("Transcript")
            .setEmoji(`<:staff:1324749168434221099>`)
            .setURL(`${a.attachments.first().url}`),
        );

      const tiempoActualEnSegundos = Math.floor(Date.now() / 1000);

      const embed = new EmbedBuilder()
        .setTitle('Transcript del ticket con éxito')
        .setFooter({ text: `Sistema de tickets de ${interaction.guild.name}`, iconURL: interaction.guild.iconURL({ dynamic: true }) })
        .addFields(
          { name: '<:staff:1324749168434221099> ・ Canal ', value: `${interaction.channel.name}`, inline: true },
          { name: '<:staff:1324749168434221099> ・ Creado por ', value: `<@${interaction.user.id}>`, inline: true },
          { name: '<:staff:1324749168434221099> ・ Tiempo del transcript', value: `<t:${tiempoActualEnSegundos}:R>`, inline: true },
        )
        .setColor(config.colorMain);

      interaction.editReply({ embeds: [embed], components: [row] });
    }, 1000));
  },
};