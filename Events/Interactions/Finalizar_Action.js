const { ModalBuilder, TextInputBuilder, ActionRowBuilder } = require('discord.js');

module.exports = {
  customId: 'finalizar',
  async execute(client, interaction) {
    const modal = new ModalBuilder()
      .setTitle("Razón")
      .setCustomId("razon_ticket");

    const razone = new TextInputBuilder()
      .setCustomId("razon_text")
      .setLabel("Pon la razón")
      .setValue('No hay razón')
      .setPlaceholder("Escribe la razón del cierre del ticket")
      .setStyle("Short")
      .setRequired(true);

    const row = new ActionRowBuilder().addComponents(razone);

    modal.addComponents(row);

    await interaction.showModal(modal);
  },
};