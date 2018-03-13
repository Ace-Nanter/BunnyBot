'use strict'
/*
const yt = require('ytdl-core');


function playsong(context) {

    var channel = context['msg'].channel;
    var args = context['args'];

    if(channel) {
            
            let url = "https://www.youtube.com/watch?v=YQHsXMglC9A";

            context['msg'].member.voiceChannel.join().then(connection => {
                const stream = yt(url, { audioonly: true });
                const dispatcher = connection.playStream(stream, {passes: 1, seek: 0, volume: 1});
            }).catch(err => reject(err));
    }
    else {
        console.log("Command sayHello : error getting channel");
    }
}

exports.playsong = playsong;*/