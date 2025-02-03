const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
  customId: 'staff',
  async execute(client, interaction) {
    await interaction.deferUpdate();

    const embed2 = new EmbedBuilder()
      .setDescription(`Solo los miembros del staff pueden utilizar este comando! <@${interaction.user.id}>`)
      .setColor(config.colorMain);

    if (!interaction.member.roles.cache.has(config.rolStaff)) return interaction.channel.send({ embeds: [embed2] });

    const embed = new EmbedBuilder()
      .setTitle("Acciones staff")
      .setDescription("Haga click en los botones de abajo segun las acciones que quieras realizar")
      .setFooter({ text: "Este boton solo lo puede utilizar la staff" })
      .setColor(config.colorMain);

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("agregar")
          .setStyle("Success")
          .setLabel("Agregar miembro")
          .setEmoji(`<:icons_djoin:875754472834469948>`),
        new ButtonBuilder()
          .setCustomId("remover")
          .setStyle("Danger")
          .setLabel("Remover miembro")
          .setEmoji(`<:icons_kick:859424400557604886>`),
        new ButtonBuilder()
          .setCustomId("agregar_rol")
          .setStyle("Success")
          .setLabel("Agregar Rol")
          .setEmoji(`<:icons_roles:866605189029298197>`),
      );

    await interaction.channel.send({ embeds: [embed], components: [row] });
  },
};