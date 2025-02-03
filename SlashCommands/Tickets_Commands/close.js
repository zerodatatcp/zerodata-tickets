const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const Ticket = require('./../../Schemas/tickets.js');
const config = require('./../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('close')
    .setDescription('Cierra un ticket'),

  async run(client, interaction) {
    try {
      const ticket = await Ticket.findOne({ channelId: interaction.channel.id });

      if (!ticket) {
        return await interaction.reply({ content: "No puedes usar este comando aquí!", ephemeral: true });
      }

      const raw = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId("finalizar")
            .setStyle(ButtonStyle.Danger)
            .setLabel("Finalizar")
            .setEmoji('875395222673186817'),
          new ButtonBuilder()
            .setCustomId("reabrir")
            .setStyle(ButtonStyle.Success)
            .setLabel("Re abrir")
            .setEmoji('860487640720343071'),
          new ButtonBuilder()
            .setCustomId("transcript")
            .setStyle(ButtonStyle.Secondary)
            .setLabel("Guarda el ticket")
            .setEmoji('860133546173923388')
        );

      const embed51 = new EmbedBuilder()
        .setDescription(`El ticket ha sido cerrado por <@${interaction.user.id}>. Pulse el botón según la siguiente acción que quieras realizar`)
        .setColor(config.colorMain);

      await interaction.reply({ embeds: [embed51], components: [raw] });

      const usuario = await client.users.fetch(ticket.userId);
      await interaction.channel.permissionOverwrites.edit(usuario, {
        ViewChannel: false
      });

      const canal = await client.channels.fetch(interaction.channel.id);
      const embed = await canal.messages.fetch(ticket.messageId);
      const embed1 = EmbedBuilder.from(embed.embeds[0]);
      embed1.spliceFields(1, 1, { name: embed1.data.fields[1].name, value: '```brainfuck\nEl ticket se encuentra cerrado```' });

      await embed.edit({ embeds: [embed1] });
    } catch (error) {
      console.error('Error al cerrar el ticket:', error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: "Ocurrió un error al cerrar el ticket. Por favor, inténtelo de nuevo más tarde.", ephemeral: true });
      } else {
        await interaction.reply({ content: "Ocurrió un error al cerrar el ticket. Por favor, inténtelo de nuevo más tarde.", ephemeral: true });
      }
    }
  }
};