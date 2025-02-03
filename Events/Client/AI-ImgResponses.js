const Discord = require('discord.js');
const config = require('../../config.json');
const ZERODATAID = '1332007081179480155'; // ID del canal de ZERODATA

const createResponses = (guild) => {
  const mainColor = config.mainColor || '#000000'; // Valor por defecto si no está definido

  return [
    {
      text: "connecting to the server#2",
      embed: new Discord.EmbedBuilder()
        .setTitle("Error connecting server #2")
        .setDescription(`
          > Try to check if your internet connection is stable.
          > Disable firewall.
          > Use VPN for example NordVPN.
          > For "Details: 1006 TLS handshake failed" redownload from [Link](https://.eu/clientarea/download)
        `)
        .setColor(mainColor)
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .setFooter({
          text: `${guild.name}・All rights reserved ©2022`,
          iconURL: guild.iconURL({ dynamic: true }),
        }),
    },
    {
      text: "another error message",
      embed: new Discord.EmbedBuilder()
        .setTitle("Another Error")
        .setDescription(`
          > Description for another error.
          > Steps to resolve the error.
        `)
        .setColor(mainColor)
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .setFooter({
          text: `${guild.name}・All rights reserved ©2022`,
          iconURL: guild.iconURL({ dynamic: true }),
        }),
    },
    {
      text: 'boy by zerodata.tcp',
      action: async (message) => {
        const staffRole = message.guild.roles.cache.get(config.rolStaff);
        if (staffRole) {
          await message.channel.send(`${staffRole}, el usuario ${message.author} ha realizado el partner correctamente.`);
        } else {
          console.error(`No se encontró el rol con ID ${config.rolStaff}`);
        }
      }
    },
    {
      text: 'zerodata.tcp@gmail.com',
      action: async (message) => {
        if (ZERODATAID) {
          await message.channel.send(`El usuario ${message.author} ha enviado una evidencia de pago, porfavor, espere la respuesta de <@${ZERODATAID}>, le atenderá y recibirá su producto/servicio lo antes posible.`);
        } else {
          console.error(`No se encontró el rol con ID ${config.rolStaff}`);
        }
      }
    },
    {
      text: 'Miguel Miranda',
      action: async (message) => {
        if (ZERODATAID) {
          await message.channel.send(`El usuario ${message.author} ha enviado una evidencia de pago, porfavor, espere la respuesta de <@${ZERODATAID}>, le atenderá y recibirá su producto/servicio lo antes posible.`);
        } else {
          console.error(`No se encontró el rol con ID ${config.rolStaff}`);
        }
      }
    }
    // Añade más respuestas aquí
  ];
};

module.exports = createResponses;