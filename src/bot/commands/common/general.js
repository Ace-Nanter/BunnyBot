'use strict'

function sayHello(context) {

    var channel = context['msg'].channel;
    var args = context['args'];

    if(args && channel) {
        channel.sendMessage("Hello " + args + " !");
    }
    else {
        channel.sendMessage("Hello @everyone ! I am bunnybot !");
    }
}

exports.sayhello = sayHello;