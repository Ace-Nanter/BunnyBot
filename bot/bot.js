'use strict'

exports.launchBot = function( Discord, token ) {

    var client = new Discord.Client();

    client.on('ready', () => {
        console.log('Bot launched.');
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
}
