const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const TempRole = require('../../Schemas/tempRole');
const ms = require('ms');
const config = require('../../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('temp-role')
    .setDescription('Asigna un rol temporal a un usuario.')
    .addUserOption(option => 
      option.setName('usuario')
        .setDescription('El usuario al que deseas asignar el rol.')
        .setRequired(true))
    .addRoleOption(option => 
      option.setName('rol')
        .setDescription('El rol que deseas asignar.')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('tiempo')
        .setDescription('El tiempo durante el cual el usuario tendrá el rol (ej. 1h, 2d).')
        .setRequired(true)),

  async run(client, interaction) {
    try {
      const user = interaction.options.getUser('usuario');
      const role = interaction.options.getRole('rol');
      const time = interaction.options.getString('tiempo');
      const guild = interaction.guild;

      const member = guild.members.cache.get(user.id);
      if (!member) {
        return interaction.reply({ content: 'Usuario no encontrado en el servidor.', ephemeral: true });
      }

      // Verificar si el usuario que ejecuta el comando tiene uno de los roles permitidos
      const hasPermission = interaction.member.roles.cache.some(role => config.AdminRoles.includes(role.id));
      if (!hasPermission) {
        return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
      }

      const duration = ms(time);
      if (!duration) {
        return interaction.reply({ content: 'Tiempo inválido.', ephemeral: true });
      }

      const expiresAt = new Date(Date.now() + duration);

      await member.roles.add(role);

      const tempRole = new TempRole({
        userId: user.id,
        roleId: role.id,
        guildId: guild.id,
        expiresAt: expiresAt,
      });

      await tempRole.save();

      // Embed para el canal
      const embedAssignChannel = new EmbedBuilder()
        .setTitle('Rol Temporal Asignado')
        .setDescription(`> El rol **${role.name}** ha sido asignado a **${user.tag}** por **${time}**.`)
        .addFields(
          { name: ' ・ Usuario', value: `${user}`, inline: true },
          { name: ' ・ Rol', value: `<@&${role.id}>`, inline: true },
          { name: ' ・ Duración', value: `${time}`, inline: true }
        )
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: `Sistema de Roles Temporales - ${guild.name}`, iconURL: guild.iconURL({ dynamic: true }) })
        .setTimestamp()
        .setColor('#57f288');

      // Embed para el MD
      const embedAssignDM = new EmbedBuilder()
        .setTitle('Rol Temporal Asignado')
        .setDescription(`> El rol **${role.name}** ha sido asignado a **${user.tag}** por **${time}**.`)
        .addFields(
          { name: ' ・ Usuario', value: `${user}`, inline: true },
          { name: ' ・ Rol', value: `${role.name}`, inline: true },
          { name: ' ・ Duración', value: `${time}`, inline: true }
        )
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: `Sistema de Roles Temporales - ${guild.name}`, iconURL: guild.iconURL({ dynamic: true }) })
        .setTimestamp()
        .setColor('#57f288');

      const logChannel = guild.channels.cache.get(config.logs_temproles);
      if (logChannel) {
        await logChannel.send({ embeds: [embedAssignChannel] });
      }

      try {
        await user.send({ embeds: [embedAssignDM] });
      } catch (error) {
        console.error(`No se pudo enviar el mensaje al usuario: ${error.message}`);
      }

      await interaction.reply({ content: 'Rol temporal asignado correctamente.', ephemeral: true });
      await interaction.channel.send({ embeds: [embedAssignChannel] });
    } catch (error) {
      console.error(`Error al asignar el rol temporal: ${error.message}`);
      await interaction.reply({ content: 'Hubo un error al asignar el rol temporal. Por favor, inténtalo de nuevo más tarde.', ephemeral: true });
    }
  },
};