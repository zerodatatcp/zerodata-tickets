  const fs = require('fs')
  const Discord = require('discord.js')
  require('dotenv').config()
  const { REST } = require('@discordjs/rest')
  const { Routes } = require('discord-api-types/v9')
  const config = require('./config.json')
  
  const commands = []
  
  fs.readdirSync('./SlashCommands').forEach(async(categorys) => {
    const commandFilesSlash = fs.readdirSync(`./SlashCommands/${categorys}`).filter((archivo) => archivo.endsWith('js'))
    for(const archivo of commandFilesSlash){
      const command = require(`./SlashCommands/${categorys}/${archivo}`)
      commands.push(command.data.toJSON())
    }
  })
  
  const rest = new REST({ version: '9' }).setToken(config.token)
  
  async function createSlash(){
    try{
      await rest.put(
        Routes.applicationCommands(config.botId), {
          body: commands
        }
      )
      console.log('✅ | Los slash commands cargados')
    } catch (e) {
      console.log(e) 
    }
  }
  
  createSlash()