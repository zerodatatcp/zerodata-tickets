const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    PermissionFlagsBits,
} = require("discord.js");

const config = require('../../config.json')
const { ButtonStyle } = require('discord.js');
const Discord = require('discord.js')
const mongoose = require("mongoose")
const Asumidos = require("../../Schemas/asumidos.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName('asumidos')
        .setDescription('Mira la lista de personas asumidas.'),
    
    async run(client, interaction) {

        const embed3 = new Discord.EmbedBuilder()
            .setDescription(`Only staff members can use this command! <@${interaction.user.id}>`)

        if (!interaction.member.roles.cache.has(`${config.rolStaff}`)) return interaction.channel.send({ embeds: [embed3] })

        async function paginacion(interaction, client, texto, elementos_por_pagina = 10) {

            var embeds = [];
            var dividido = elementos_por_pagina;

            for (let i = 0; i < texto.length; i += dividido) {

                let desc = texto.slice(i, elementos_por_pagina);

                elementos_por_pagina += dividido;

                let embed = new Discord.EmbedBuilder()
                    .setTitle("Lista de roles asumidos")
                    .setDescription(desc.join(" "))
                    .setColor(config.colorMain)
                    .setAuthor({ name: `${interaction.user.username} • ${interaction.guild.name}`, iconURL: interaction.member.displayAvatarURL({ dynamic: true }) })
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                embeds.push(embed)

            }

            let paginaActual = 0;

            if (embeds.length === 1) return interaction.reply({ embeds: [embeds[0]] }).catch(() => { });

            let boton_atras = new Discord.ButtonBuilder().setStyle(ButtonStyle.Success).setCustomId('Atrás').setEmoji('<:icons_dleave:875754473023229972>').setLabel('Anterior')
            let boton_inicio = new Discord.ButtonBuilder().setStyle(ButtonStyle.Danger).setCustomId('Inicio').setEmoji('<:icons_bank:949635040252428318>').setLabel('Inicio')
            let boton_avanzar = new Discord.ButtonBuilder().setStyle(ButtonStyle.Success).setCustomId('Avanzar').setEmoji('<:icons_djoin:875754472834469948>').setLabel('Siguiente')

            let embedpaginas = await interaction.channel.send({
                embeds: [embeds[0].setFooter({ text: `Pagina ${paginaActual + 1} / ${embeds.length}` })],
                components: [new Discord.ActionRowBuilder().addComponents([boton_atras, boton_inicio, boton_avanzar])]
            });

            const collector = embedpaginas.createMessageComponentCollector({ time: 180e3 });

            collector.on("collect", async b => {
                if (b?.user.id !== interaction.member.id) return b?.reply({ content: `No puedes usar este botón!`, ephemeral: true });

                switch (b?.customId) {
                    case "Atrás": {
                        collector.resetTimer();
                        if (paginaActual !== 0) {
                            paginaActual -= 1
                        } else {
                            paginaActual = embeds.length - 1
                        }
                        await embedpaginas.edit({ embeds: [embeds[paginaActual].setFooter({ text: `Pagina ${paginaActual + 1} / ${embeds.length}` })], components: [embedpaginas.components[0]] }).catch(() => { });
                        await b?.deferUpdate();
                    }
                        break;

                    case "Inicio": {
                        collector.resetTimer();
                        paginaActual = 0;
                        await embedpaginas.edit({ embeds: [embeds[paginaActual].setFooter({ text: `Pagina ${paginaActual + 1} / ${embeds.length}` })], components: [embedpaginas.components[0]] }).catch(() => { });
                        await b?.deferUpdate();
                    }
                        break;

                    case "Avanzar": {
                        collector.resetTimer();
                        if (paginaActual < embeds.length - 1) {
                            paginaActual++
                        } else {
                            paginaActual = 0
                        }
                        await embedpaginas.edit({ embeds: [embeds[paginaActual].setFooter({ text: `Pagina ${paginaActual + 1} / ${embeds.length}` })], components: [embedpaginas.components[0]] }).catch(() => { });
                        await b?.deferUpdate();
                    }
                        break;

                    default:
                        break;
                }
            });

            collector.on("end", () => {
                embedpaginas.components[0].components.map(boton => boton.disabled = true)
                embedpaginas.edit({ content: `El tiempo ha expirado!`, embeds: [embeds[paginaActual].setFooter({ text: `Pagina ${paginaActual + 1} / ${embeds.length}` })], components: [embedpaginas.components[0]] }).catch(() => { });
            });
        }

        const dataGlobal = await Asumidos.find().sort([["cantidad", "descending"]]).exec()

        if (!dataGlobal) return interaction.reply({ content: "No hay asumidos en el server.", ephemeral: true })

        const staffMembers = interaction.guild.roles.cache.get(config.rolStaff).members;

        let texto = staffMembers.map(member => {
            const data = dataGlobal.find(d => d.staffId === member.id);
            return {
                user: member.user,
                cantidad: data ? data.cantidad : 0
            };
        }).sort((a, b) => b.cantidad - a.cantidad)
          .map(entry => `**<@${entry.user.id}>** - \`${entry.cantidad}\` tickets\n`);

        paginacion(interaction, client, texto)
    },
};