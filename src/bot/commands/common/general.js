'use strict'

function sayHello(context) {

    var channel = context['msg'].channel;
    var args = context['args'];

    if(channel) {
        if(args) {
            channel.sendMessage("Hello " + args + " !");
        }
        else {
            channel.sendMessage("Hello @everyone ! I am bunnybot !");
        }
    }
    else {
        console.log("Command sayHello : error getting channel");
    }
}

exports.sayhello = sayHello;