const config = require('./config/config.js');
var Discord = require('discord.js');

var bot = require('./bot/bot.js');
const token = config.token;

bot.launchBot(Discord, token);