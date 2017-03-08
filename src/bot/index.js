'use strict'

var Discord = require('discord.js');
const config = require('../../config/config.json');
const commands = require('./commands/');

// Launch the bot
var bot = new Discord.Client();

bot.on('ready', () => {
    console.log('Bot launched.');
    
    bot.user.setGame("Improve myself");
});

bot.on('message', msg => {

    if (msg.content === 'ping') {
        msg.channel.sendMessage("pong !");
    }
    if(msg.content.match(/bunny/g)) {
        msg.reply('I love bunnies !');
    }

    // If a command has been called
    if(msg.content[0] === config.PREFIX) {

        console.log('command called : ' + msg.content);

        // Get command
        const commandName = msg.content.toLowerCase().split(' ')[0].substring(1);

        // Get arguments
        const args = msg.content.substring(commandName.length + 2);

        // Look for a corresponding command
        const command = commands.commands[commandName];

        // Run command
        command();

    }

    // If the bot has been mentionned
    if(msg.mentions.users.size > 0) {
        if(msg.mentions.users.get(bot.user.id)) {

            // Do something here when the bot is mentionned
            msg.channel.sendMessage('I\'ve heard my name?');
        }
    }


});

bot.login(config.TOKEN);
