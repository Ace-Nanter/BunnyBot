'use strict'

var Discord = require('discord.js');
const config = require('../../config/config.json');
const commands = require('./commands/');
const permissions = require('./permissions.js');

// Launch the bot
var bot = new Discord.Client();

bot.on('ready', () => {
   
    console.log('Bot launched.');
});

bot.on('message', msg => {

    if(msg.channel.type === 'dm') {
        // Private message to BunnyBot
    }

    if (msg.content === 'ping') {
        msg.channel.sendMessage("pong !");
    }

    if(msg.content.match(/bunny/g)) {
        msg.reply('I love bunnies !');
    }

    // If a command has been called
    if(msg.content[0] === config.PREFIX) {

        // Get command
        const commandName = msg.content.split(' ')[0].substring(1).toLowerCase();

        console.log('command called : ' + commandName);

        // Look for a corresponding command
        const command = commands.commands[commandName];

        // Get context
        const context = 
        {
            msg: msg,
            bot: bot,
            args: msg.content.substring(commandName.length + 2)
        };

        if(command) {
            // Command exists
            permissions.checkPermissions(commandName, msg.member, function(authorized) {
                if(authorized) {
                    // The user is authorized
                    command(context);
                }
                else {
                    // The user is not authorized
                    msg.reply('sorry you are not authorized to use this command! :frowning:');
                }
            });
        }
        else {
            // Command doesn't exist
            console.log('No command found !');
            // TODO : add a message from the bot
        }
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
