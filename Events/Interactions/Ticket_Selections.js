const { EmbedBuilder, PermissionsBitField, ChannelType, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const config = require('../../config.json');
const Ticket = require('../../Schemas/tickets.js');

module.exports = {
  customId: 'tickets',
  async execute(client, interaction) {
    if (!interaction.isStringSelectMenu()) return;

    const categoryName = interaction.values[0];
    const categoryData = config.tickets[categoryName];
    if (categoryData) {
      let roles = categoryData.rol;
      const categoryID = categoryData.categoria;
      const channelName = `${categoryData.emoji_canal}┊${categoryName}-${interaction.user.username}`;
      let channelType = ChannelType.GuildText;
      const permissionOverwrites = [
        {
          id: interaction.user.id,
          allow: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: interaction.guild.roles.everyone,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
      ];

      // SET ARRAY
      if (!Array.isArray(roles)) {
        roles = [roles];
      }

      roles.forEach(roleId => {
        permissionOverwrites.push({
          id: roleId,
          allow: [PermissionsBitField.Flags.ViewChannel],
        });
      });

      const tucke = await interaction.guild.channels.create({
        name: channelName,
        type: channelType,
        permissionOverwrites: permissionOverwrites,
        parent: categoryID,
      });

      const embed2 = new EmbedBuilder()
        .setDescription(`**${interaction.user.username}**, su **TICKET** fue creado con éxito en el canal <#${tucke.id}>`)
        .setColor(`${config.colorMain}`);

      await interaction.reply({ embeds: [embed2], ephemeral: true });

      tucke.send(`<@&${roles.join('>, <@&')}>`).then((a) => a.delete());
      tucke.send(`<@${interaction.user.id}>`);

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId("clos")
            .setStyle("Danger")
            .setEmoji("<:icons_Wrong:859388130636988436>")
            .setLabel("Cerrar"),
          new ButtonBuilder()
            .setCustomId("staff")
            .setStyle("Primary")
            .setLabel("Acciones staff")
            .setEmoji(`<:icons_eventcolour:870646213429563445>`),
          new ButtonBuilder()
            .setCustomId("asumir")
            .setStyle("Success")
            .setLabel("Asumir ticket")
            .setEmoji('<:icons_Correct:859388130411282442>')
        );

      const embed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL({ dynamic: true }) })
        .setDescription(`Bienvenido a los tickets **${interaction.guild.name}**. Los miembros del staff te atenderán lo más rápido posible!`)
        .addFields(
          { name: 'Staff', value: `\`\`\`yaml\nNadie ha asumido el ticket\`\`\`` },
          { name: 'Estado del ticket', value: `\`\`\`brainfuck\nEl ticket está actualmente abierto\`\`\`` }
        )
        .setColor(config.colorMain);

      const m = await tucke.send({ embeds: [embed], components: [row] });
      m.pin();
      await new Ticket({ userId: interaction.member.id, channelId: tucke.id, messageId: m.id, asumido: false }).save();
    } else {
      console.error(`Categoría no encontrada en la configuración: ${categoryName}`);
    }
  },
};