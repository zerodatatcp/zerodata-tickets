const TempRole = require('../../Schemas/tempRole');
const { EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`✅ | Verificando roles temporales`);

    // Verificar roles temporales cada minuto
    setInterval(async () => {
      const tempRoles = await TempRole.find({ expiresAt: { $lte: new Date() } });
      for (const tempRole of tempRoles) {
        const guild = client.guilds.cache.get(tempRole.guildId);
        if (guild) {
          const member = guild.members.cache.get(tempRole.userId);
          if (member) {
            await member.roles.remove(tempRole.roleId);

            // Embed para el canal
            const embedRemoveChannel = new EmbedBuilder()
              .setTitle('Rol Temporal Removido')
              .setDescription(`> El rol <@&${tempRole.roleId}> ha sido removido de <@${tempRole.userId}>.`)
              .addFields(
                { name: ' ・ Usuario', value: `<@${tempRole.userId}>`, inline: true },
                { name: ' ・ Rol', value: `<@&${tempRole.roleId}>`, inline: true }
              )
              .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
              .setFooter({ text: `Sistema de Roles Temporales - ${guild.name}`, iconURL: guild.iconURL({ dynamic: true }) })
              .setTimestamp()
              .setColor('#ff0000');

            // Embed para el MD
            const embedRemoveDM = new EmbedBuilder()
              .setTitle('Rol Temporal Removido')
              .setDescription(`> El rol **${member.guild.roles.cache.get(tempRole.roleId).name}** ha sido removido de **${member.user.tag}**.`)
              .addFields(
                { name: ' ・ Usuario', value: `${member.user.tag}`, inline: true },
                { name: ' ・ Rol', value: `${member.guild.roles.cache.get(tempRole.roleId).name}`, inline: true }
              )
              .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
              .setFooter({ text: `Sistema de Roles Temporales - ${guild.name}`, iconURL: guild.iconURL({ dynamic: true }) })
              .setTimestamp()
              .setColor('#ff0000');

            const logChannel = guild.channels.cache.get(config.logs_temproles);
            if (logChannel) {
              await logChannel.send({ embeds: [embedRemoveChannel] });
            }

            try {
              await member.send({ embeds: [embedRemoveDM] });
            } catch (error) {
              console.error(`No se pudo enviar el mensaje al usuario: ${error.message}`);
            }
          }
        }
        await TempRole.deleteOne({ _id: tempRole._id });
      }
    }, 60000); // 60000 ms = 1 minuto
  },
};