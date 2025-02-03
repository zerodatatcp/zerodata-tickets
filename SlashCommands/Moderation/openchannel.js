const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionsBitField,
} = require("discord.js");

const config = require('./../../config.json')
const Discord = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('open_channel')
    .setDescription('Abre un canal')
    .addChannelOption(option =>
      option
        .setName('canal')
        .setDescription('El canal que quieres abrir')
    ),
 
  async run(client, interaction) {

    // Verificar si el usuario tiene el rol de staff
    const member = interaction.member;
    const staffRole = config.rolStaff;

    if (!member.roles.cache.has(staffRole)) {
      return interaction.reply({ content: '❌ ¡No tienes los permisos suficientes!', ephemeral: true });
    }

    let channel = interaction.options.getChannel('canal') || interaction.channel;
    const role = interaction.guild.roles.everyone;

    if (channel.permissionsFor(role).has(PermissionsBitField.Flags.SendMessages) === true) {
      return interaction.reply({ content: `El canal ${channel} ya está abierto.`, ephemeral: true });
    }

    try {
      // Actualizamos los permisos para permitir el envío de mensajes
      await channel.permissionOverwrites.edit(role, {
        SendMessages: true
      });

      const successEmbed = new Discord.EmbedBuilder()
        .setColor('#57f288')
        .setDescription(`<@${member.user.id}> ha **ABIERTO** el canal: ${channel}`)

      await interaction.reply({ embeds: [successEmbed] });

    } catch (error) {

      const errorEmbed = new Discord.EmbedBuilder()
        .setColor('#ff0000')
        .setDescription(`¡Se ha producido un error: ${error.message}`)
        .setFooter({ text: `Ejecutado por: ${member.user.tag}`, iconURL: member.user.displayAvatarURL() });

      interaction.reply({ embeds: [errorEmbed] });
    }

  },
};