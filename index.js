// ----------------------- CONSTANTES -----------------------
const Discord = require("discord.js");
const { Client, GatewayIntentBits, Partials, Collection, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const mongoose = require('mongoose');
const Ticket = require("./Schemas/tickets.js");
const config = require('./config.json');
const { ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const discordTranscripts = require('discord-html-transcripts');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, 
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers, 
  ],
  partials: [Partials.User, Partials.Message, Partials.GuildMember, Partials.ThreadMember],
});

client.on('ready', (client) => {
  console.log(`✅ | Logeado como: ${client.user.tag}`);

  client.user.setActivity({
    name: config.status,
    type: ActivityType.Streaming,
    url: config.url_status
  })
});

// ----------------------- MONGO -----------------------
mongoose.set('strictQuery', true);

let url = config.mongoUrl;
mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("✅ | Conectado a MongoDB correctamente!");
}).catch((err) => {
  console.log("Error al conectar a MongoDB:", err);
});

// ----------------------- MANEJO DE ERRORES -----------------------
process.on('unhandledRejection', error => {
  console.error(error);
});
client.on('shardError', error => {
  console.error(error);
});

// ----------------------- SLASH COMMANDS -----------------------
client.slashcommand = new Collection();
fs.readdirSync('./SlashCommands').forEach(async (categorys) => {
  const commandFilesSlash = fs.readdirSync(`./SlashCommands/${categorys}`).filter((archivo) => archivo.endsWith('js'))
  for (const archivo of commandFilesSlash) {
    const command = require(`./SlashCommands/${categorys}/${archivo}`)
    client.slashcommand.set(command.data.name, command)
    
  }
});

// ----------------------- INTERACTIONS -----------------------
client.interactions = new Collection();
const interactionsPath = path.join(__dirname, 'Events/Interactions');
const interactionFiles = fs.readdirSync(interactionsPath).filter(file => file.endsWith('.js'));

for (const file of interactionFiles) {
  const filePath = path.join(interactionsPath, file);
  const interaction = require(filePath);
  if ('customId' in interaction && 'execute' in interaction) {
    client.interactions.set(interaction.customId, interaction);
  } else {
    console.log(`[ADVERTENCIA] La interacción en ${filePath} está faltando una propiedad requerida 'customId' o 'execute'.`);
  }
}

client.on('interactionCreate', async interaction => {
  if (interaction.isCommand()) {
    const command = client.slashcommand.get(interaction.commandName);
    if (!command) return;

    try {
      await command.run(client, interaction);
    } catch (e) {
      console.log(e);
      return interaction.reply({ content: `Hubo un error **${e}**`, ephemeral: true });
    }
  }

  if (interaction.isButton() || interaction.isStringSelectMenu()) {
    const interactionHandler = client.interactions.get(interaction.customId);
    if (interactionHandler) {
      try {
        await interactionHandler.execute(client, interaction);
      } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Hubo un error al ejecutar esta interacción.', ephemeral: true });
      }
    } else {
      console.log(`No se encontró un manejador para la interacción con ID: ${interaction.customId}`);
    }
  }

  if (interaction.isModalSubmit()) {
    if (interaction.customId === "razon_ticket") {
      const data = await Ticket.findOne({ channelId: interaction.channel.id });

      const embed21 = new EmbedBuilder()
        .setDescription("Este ticket va a ser **borrado dentro de poco**, se están realizando acciones externas.")
        .setColor(config.colorMain);

      await interaction.reply({ embeds: [embed21] });

      const razon = interaction.fields.getTextInputValue("razon_text");

      const usuario = interaction.guild.members.resolve(data.userId);

      const canal = interaction.guild.channels.cache.get(config.transcript_logs);
      const canal_logs = interaction.guild.channels.cache.get(config.logs);
      const channel = interaction.channel;

      const attachment = await discordTranscripts.createTranscript(channel, {
        fileName: `${interaction.channel.name}.html`
      });

      canal.send({
        files: [attachment],
        content: "El transcript del ticket"
      }).then((a) => setTimeout(async () => {
        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setStyle("Link")
              .setLabel("Transcript")
              .setEmoji(`<:icons_richpresence:860133546173923388>`)
              .setURL(`${a.attachments.first().url}`),
          );

        const tiempoActualEnSegundos = Math.floor(Date.now() / 1000);

        const embed = new EmbedBuilder()
          .setTitle('Ticket cerrado')
          .setDescription(`> Razón: ${razon}`)
          .setFooter({ text: `Sistema de tickets・${interaction.guild.name}`, iconURL: interaction.guild.iconURL({ dynamic: true }) })
          .addFields(
            { name: ' ・ Ticket ', value: `${interaction.channel.name}`, inline: true },
            { name: ' ・ Abierto por ', value: `<@${data.userId}>`, inline: true },
            { name: ' ・ Cerrado por ', value: `<@${interaction.user.id}>`, inline: true },
            { name: ' ・ Cuando se cerró ', value: `<t:${tiempoActualEnSegundos}:R>`, inline: true },
            { name: ' ・ Cuando se abrió ', value: `<t:${Math.round(interaction.channel.createdTimestamp / 1000)}>`, inline: true },
          )
          .setColor(config.colorMain);

        try {
          await Ticket.findOneAndDelete({ channelId: interaction.channel.id });
          await interaction.channel.delete();
          
          // Siempre enviamos al canal de logs
          await canal_logs.send({ embeds: [embed], components: [row] });
          
          // Intentamos enviar al MD del usuario
          try {
            await usuario.send({ embeds: [embed], components: [row] });
          } catch (dmError) {
            console.log("No se pudo enviar al MD:", dmError.message);
            await canal_logs.send({ content: `No se pudo enviar el mensaje al MD de <@${data.userId}>. Razón: ${dmError.message}` });
          }
        } catch (error) {
          console.error("Error al cerrar el ticket:", error);
          await interaction.followUp({ content: "Hubo un error al cerrar el ticket. Por favor, contacta a un administrador.", ephemeral: true });
        }
      }, 1000));
    }
  }
});

client.on('error', (error) => {
  console.error('Error en el cliente de Discord:', error);
});

// ----------------------- EVENTS -----------------------
const eventsPath = path.join(__dirname, 'Events/Client');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(client, ...args));
  } else {
    client.on(event.name, (...args) => event.execute(client, ...args));
  }
}

// ----------------------- REGISTRAR COMANDOS -----------------------
const commands = Array.from(client.slashcommand.values()).map(command => command.data.toJSON());

const rest = new REST({ version: '9' }).setToken(config.token);

(async () => {
  try {
    console.log('✅ | Comenzando a actualizar los comandos de aplicación (/).');

    await rest.put(
      Routes.applicationGuildCommands(config.botId, config.guildId),
      { body: commands },
    );

    console.log('✅ | Comandos de aplicación (/) actualizados exitosamente.');
  } catch (error) {
    console.error('Hubo un error al actualizar los comandos:', error);
  }
})();

client.login(config.token);