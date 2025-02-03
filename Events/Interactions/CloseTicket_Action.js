const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const config = require('../../config.json');
const Ticket = require("../../Schemas/tickets.js");

module.exports = {
  customId: 'clos',
  async execute(client, interaction) {
    const raw = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("finalizar")
          .setStyle("Danger")
          .setLabel("Finalizar")
          .setEmoji(`<:icons_store:875395222673186817>`),
        new ButtonBuilder()
          .setCustomId("reabrir")
          .setStyle("Success")
          .setLabel("Re abrir")
          .setEmoji(`<:icons_join:860487640720343071>`),
        new ButtonBuilder()
          .setCustomId("transcript")
          .setStyle("Secondary")
          .setLabel("Guarda el ticket")
          .setEmoji(`<:icons_richpresence:860133546173923388>`)
      );

    await interaction.deferUpdate();

    const cerrando_ticket = new EmbedBuilder()
      .setDescription("Cerrando ticket, por favor espera.")
      .setColor(config.colorMain);

    const ticket_cerrado_actions = new EmbedBuilder()
      .setDescription(`El ticket ha sido cerrado por <@${interaction.user.id}>. Pulse el botón según la siguiente acción que quieras realizar`)
      .setColor(config.colorMain);

    interaction.followUp({ embeds: [cerrando_ticket] })
      .then((c) => setTimeout(async () => {
        interaction.channel.send({ embeds: [ticket_cerrado_actions], components: [raw] });

        let data = await Ticket.findOne({ channelId: interaction.channel.id });
        const usuarioo = await interaction.guild.members.fetch(data.userId);

        interaction.channel.permissionOverwrites.edit(usuarioo, {
          ViewChannel: false
        });

        const canal = client.channels.cache.get(interaction.channel.id);
        const embed = await canal.messages.fetch(data.messageId);

        const embed1 = embed.embeds[0];
        embed1.fields[1].value = ` \`\`\`brainfuck\nEl ticket se encunetra cerrado\`\`\` `;

        embed.edit({ embeds: [embed1] });
      }, 1000));
  },
};