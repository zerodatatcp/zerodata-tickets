const { profileImage } = require("discord-arts");
const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const config = require('../../config.json');

module.exports = {
  name: 'guildMemberAdd',
  async execute(client, member) {
    try {
      const canal = await member.client.channels.fetch(config.welcome_channel);
      const canal_logs = await member.client.channels.fetch(config.welcome_logs);
      const tiempoSeg = Date.now() / 1000;
      const tiempoUnix = Math.floor(tiempoSeg);
      const discordUser = member.user.id;

      const bufferImg = await profileImage(discordUser);
      const imgAttachment = new AttachmentBuilder(bufferImg, { name: "profile.png" });

      const mensaje = await canal_logs.send({ files: [imgAttachment] });
      const imageURL = mensaje.attachments.first().url;

      const embed = new EmbedBuilder()
        .setTitle('¡Se ha unido un nuevo usuario!')
        .setDescription(`> ¡Eyy! **${member.user.username}**, bienvenido a **${member.guild.name}**!`)
        .addFields(
          { name: `Usuario`, value: `${member}`, inline: true },
          { name: `Fecha en la que se unió`, value: `<t:${tiempoUnix}:F>`, inline: true }
        )
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setImage(imageURL)
        .setAuthor({ name: `Sistema Bienvenidas - ${member.guild.name}`, iconURL: member.guild.iconURL({ dynamic: true }) })
        .setFooter({ text: `Sistema Bienvenidas - ${member.guild.name}`, iconURL: member.guild.iconURL({ dynamic: true }) })
        .setTimestamp()
        .setColor(config.colorMain);

      canal.send({ content: `${member}`, embeds: [embed] });
      //member.roles.add(config.rolVerificado);
    } catch (error) {
      console.error(`Error handling guildMemberAdd event: ${error.message}`);
    }
  },
};