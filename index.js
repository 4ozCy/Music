require('dotenv').config(); // Load environment variables from .env file

const { Client, GatewayIntentBits } = require('discord.js');
const { Node, PlayerManager } = require('discord.js-lavalink');

const client = new Client({ 
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildVoiceStates],
    partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember],
});
const nodes = [
    { 
        host: 'lava-v3.ajieblogs.eu.org', 
        port: 443, 
        password: 'https://dsc.gg/ajidevserver',
        secure: true // Secure connection (HTTPS)
    }
];

client.player = new PlayerManager(client, nodes, {
    user: process.env.CLIENT,
    shards: 1,
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    const args = message.content.split(' ');
    const command = args.shift().toLowerCase();

    if (command === '.p') {
        if (!args[0]) return message.reply('You need to provide a song name or URL!');
        if (!message.member.voice.channel) return message.reply('You need to join a voice channel first!');

        const player = client.player.get(message.guild.id);
        if (!player) {
            client.player.spawn({
                guild: message.guild.id,
                voiceChannel: message.member.voice.channel.id,
                textChannel: message.channel.id,
                node: '1' // Since there’s only one node, this is optional but can stay as is.
            });
        }

        const node = client.player.nodes.get('1');
        const search = await node.rest.resolve(args.join(' '));
        if (!search.tracks.length) return message.reply('No results found!');

        const track = search.tracks[0];
        client.player.get(message.guild.id).play(track.track);

        return message.reply(`Now playing: **${track.info.title}**`);
    }

    if (command === '.s') {
        const player = client.player.get(message.guild.id);
        if (!player) return message.reply('I am not playing anything right now!');

        player.stop();
        client.player.leave(message.guild.id);

        return message.reply('Stopped the music and left the voice channel.');
    }
});

client.login(process.env.TOKEN);
