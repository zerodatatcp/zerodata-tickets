const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  TextInputStyle,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
} = require("discord.js");

const config = require('../../config.json');
const { ButtonStyle } = require('discord.js');
const Discord = require('discord.js');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Tesseract = require("tesseract.js");
const fetch = require("node-fetch");
const createResponses = require('./AI-ImgResponses');

const MODEL = config.MODEL;
const API_KEY = config.API_KEY;
const CATEGORY_IDS = config.CATEGORY_IDS;
const logChannelId = config.logChannelId;
const STAFF_ROLE_ID = config.rolStaff; 

const userMentions = new Map();
const conversationHistories = new Map();

const ai = new GoogleGenerativeAI(API_KEY);
const model = ai.getGenerativeModel({
  model: MODEL,
});

const disabledChannels = new Set();

const BASE_PROMPT = `
pon aqui tu prompt
`;

module.exports = {
  name: 'messageCreate',
  async execute(client, message) {
    try {
      const isInAllowedCategory = CATEGORY_IDS.includes(message.channel.parentId);
      const isAICommand = message.content.toLowerCase().startsWith('!ai');

      if (!isInAllowedCategory || !isAICommand) {
        return;
      }

      if (message.author.bot) return;

      const isStaff = message.member.roles.cache.has(STAFF_ROLE_ID);

      if (disabledChannels.has(message.channel.id)) {
        if (message.content.toLowerCase().includes("!activarai")) {
          disabledChannels.delete(message.channel.id);
          return message.reply("La IA ha sido activada de nuevo en este canal.");
        }
        return;
      }

      if (message.content.toLowerCase().includes("!desactivarai")) {
        disabledChannels.add(message.channel.id);
        return message.reply("La IA ha sido desactivada en este canal.");
      }

      const userMessage = isStaff ? message.content.slice(3).trim() : message.content;
      if (!userMessage && message.attachments.size === 0) {
        return message.reply("Por favor, proporciona un mensaje o una imagen después de !ai.");
      }

      if (message.attachments.size > 0) {
        const attachment = message.attachments.first();
        const imageBuffer = await getImageBuffer(attachment.url);
        const text = await recognizeText(imageBuffer);

        const responses = createResponses(message.guild); 

        for (const response of responses) {
          if (text.includes(response.text)) {
            if (response.embed) {
              await message.channel.send({ embeds: [response.embed] });
            } else if (response.action) {
              await response.action(message);
            }
            return; 
          }
        }
      }

      if (userMessage) {
        const conversationKey = `${message.channel.id}-${message.author.id}`;
        if (!conversationHistories.has(conversationKey)) {
          conversationHistories.set(conversationKey, []);
        }

        const conversationHistory = conversationHistories.get(conversationKey);
        conversationHistory.push(`Usuario: ${userMessage}`);

        const prompt = `${BASE_PROMPT}\n${conversationHistory.join('\n')}\nAsistente:`;

        const { response } = await model.generateContent(prompt);
        const generatedText = response.text().trim();

        const finalResponse =
          generatedText.length > 0
            ? generatedText.length > 2000
              ? generatedText.substring(0, 1997) + "..."
              : generatedText
            : "Lo siento, no pude generar una respuesta apropiada.";

        conversationHistory.push(`Asistente: ${finalResponse}`);
        conversationHistories.set(conversationKey, conversationHistory);

        await message.reply({
          content: finalResponse,
          allowedMentions: {
            parse: ["everyone", "roles", "users"],
          },
        });
      }
    } catch (e) {
      console.error(e);

      const errorEmbed = new Discord.EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Error al generar la respuesta de IA')
        .setDescription(`Hubo un error al intentar generar una respuesta: ${e.message}`)
        .setTimestamp();

      const logChannel = client.channels.cache.get(logChannelId);
      if (logChannel) {
        logChannel.send({ embeds: [errorEmbed] }).catch(console.error);
      }
    }
  },
};

async function getImageBuffer(url) {
  const response = await fetch(url);
  const buffer = await response.buffer();
  return buffer;
}

async function recognizeText(imageBuffer) {
  const {
    data: { text },
  } = await Tesseract.recognize(
    imageBuffer,
    "eng"
  );

  return text.trim();
}