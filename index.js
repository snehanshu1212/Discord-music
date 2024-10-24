const { Client, GatewayIntentBits, Events } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ]
});

const player = createAudioPlayer();

client.once(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user.tag}`);
    // Set the bot status
    client.user.setActivity('Music for you!', { type: 'LISTENING' });
});

client.on(Events.MessageCreate, async (message) => {
    if (message.content.startsWith('!play ')) {
        const url = message.content.split(' ')[1];
        const voiceChannel = message.member.voice.channel;

        if (!voiceChannel) {
            return message.reply('You need to be in a voice channel to play music!');
        }

        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
        });

        const resource = createAudioResource(ytdl(url, { filter: 'audioonly' }));
        player.play(resource);
        connection.subscribe(player);

        player.on(AudioPlayerStatus.Playing, () => {
            console.log('Now playing!');
        });

        player.on(AudioPlayerStatus.Idle, () => {
            connection.disconnect();
        });

        message.reply(`Now playing: ${url}`);
    } else if (message.content === '!stop') {
        player.stop();
        message.reply('Stopped playing music!');
    }
});

client.login(process.env.DISCORD_TOKEN);

