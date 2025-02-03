const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
} = require("discord.js");

const config = require('./../../config.json')
const Discord = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Borra mensajes del canal')
    .addStringOption(option =>
        option
            .setName('cantidad')
            .setDescription("Pon la cantidad de mensajes que quieres borrar")
            .setRequired(true)),
     
    async run(client, interaction) {

        const valor = interaction.options.getString('cantidad')

        const embed3 = new EmbedBuilder()
            .setColor('#ff0000')
            .setDescription('❌ No tienes los permisos suficientes!')
            


        if (!interaction.member.roles.cache.has(config.rolStaff)) return interaction.reply({ embeds: [embed3], ephemeral: true })

        if (valor >= 100) return interaction.reply({ content: "No pueden ser más de 100 mensajes!", ephemeral: true  }) 
        if (valor <= 1) return interaction.reply({ content: "El número no puede ser más pequeño a 1!", ephemeral: true  })
        if (isNaN(valor)) return interaction.reply({ content: "El valor tiene que ser un número!", ephemeral: true })

        interaction.channel.bulkDelete(valor).catch(err => ({}));

        interaction.reply({ content: `Se han borrado **${valor}** mensajes con éxito!`, ephemeral: true })

    },
};
