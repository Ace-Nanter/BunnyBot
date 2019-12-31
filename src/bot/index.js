'use strict'

var Discord = require('discord.js');
const config = require('../../config/config.json');
const commands = require('./commands/');
const permissions = require('./permissions.js');
const subscriptionManager = require('./subscribers');
const reactions = require('./subscribers/reactions.js');
const copySystem = require('./subscribers/spy.js');

// Launch the bot
var bot = new Discord.Client();
var newYearTimeout;

bot.on('ready', () => {

    // Launch reactions system
    reactions.initReactions(bot.guilds);
    copySystem.initCopy(bot);

    newYearTimeout = setTimeout(newYear, 60000 - (new Date() % 60000));
    newYear(bot);
  
    console.log('Bot launched.');
});

// For every message posted
bot.on('message', msg => {

    // If a command has been called
    if(msg.content[0] === config.PREFIX) {

        // Get command name
        const commandName = msg.content.split(' ')[0].substring(1).toLowerCase();

        // Get command
        const command = commands.lookForCommand(commandName);

        if(command) {
            console.log('Command called: ' + commandName);

            // Get context
            const context = 
            {
                msg: msg,
                bot: bot,
                pm: msg.channel.type === 'dm',
                args: msg.content.substring(commandName.length + 2)
            };

            commands.executeCommand(command, commandName, context);
        }
        else {
            // Command doesn't exist
            console.warn(`Command not found: ${commandName}`);
        }
    }
    else {
        // React to content
        subscriptionManager.react(msg);
    }

    // If the bot has been mentionned
    if(msg.mentions.users.size > 0) {
        if(msg.mentions.users.get(bot.user.id)) {

            // Do something here when the bot is mentionned
            msg.channel.sendMessage('I\'ve heard my name?');
        }
    }
});

bot.login(process.env.TOKEN);

function newYear() {

    var now = new Date();

    if (now.getMonth() === 0
        && now.getDate() === 1
        && now.getHours() === 0
        && now.getMinutes() === 1) {
        var channel = bot.channels.get("322508957140910092");
        channel.send("Happy new year @everyone ! :tada: \nBest wishes to you all ! :smile:");
        
        // kill the loop
        clearTimeout(newYearTimeout);
    }

    now = new Date();
}