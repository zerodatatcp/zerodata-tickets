const { joinVoiceChannel, createAudioPlayer, createAudioResource, VoiceConnectionStatus, entersState, AudioPlayerStatus } = require('@discordjs/voice');
const config = require('../../config.json');

const channelId = config.voice_channel;
const audioUrl = 'Audios/WaittingAudio.mp3';

let player;
let connection;

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    const channel = client.channels.cache.get(channelId);
    connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });

    player = createAudioPlayer();
    player.setMaxListeners(0); // Aumenta el límite de listeners a 20
    connection.subscribe(player);

    connection.on(VoiceConnectionStatus.Ready, () => {
      playAudio();
    });

    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([
          entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
          entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
        ]);
      } catch (error) {
        connection.destroy();
      }
    });

    client.on('voiceStateUpdate', (oldState, newState) => {
      if (newState.channelId && newState.channelId !== oldState.channelId && newState.channelId === config.voice_channel) {
        playAudio();
      }

      if (newState.id === client.user.id) {
        if (newState.channelId !== config.voice_channel) {
          const channel = client.channels.cache.get(config.voice_channel);
          connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
          });

          player = createAudioPlayer();
          player.setMaxListeners(0); 
          connection.subscribe(player);

          connection.on(VoiceConnectionStatus.Ready, () => {
            playAudio();
          });

          connection.on(VoiceConnectionStatus.Disconnected, async () => {
            try {
              await Promise.race([
                entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
              ]);
            } catch (error) {
              connection.destroy();
            }
          });
        }
      }
    });
  },
};

function playAudio() {
  const resource = createAudioResource(audioUrl);
  player.play(resource);
  player.on(AudioPlayerStatus.Idle, () => {
    setTimeout(playAudio, 10000); 
  });
  player.on('error', error => {
    console.error(`Error al reproducir el audio: ${error.message}`);
  });
}