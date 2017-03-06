var Discord = require("discord.js");
var client = new Discord.Client();
const token = 'Mjg4MzAzMDY0MjUzNzI2NzIw.C572tg.GV5cfaOL0XdhiAstMHF3NsL9ipE';


client.on('ready', () => {
  console.log('I am ready !');
  
  var channel = client.channels.find("name", "general");
  channel.sendMessage("Hello I am bunnyBot !");
});

client.on('message', msg => {

  if (msg.content === 'ping') {
    msg.channel.sendMessage("pong !");
  }
  if(msg.content.match(/bunny/g)) {
    msg.reply('I love bunnies !');
  }
});

client.login(token);