/**
 * Let Bunny Bot play to Discord RPG
 */

const prefix = '#!';        // Prefix for discordRPG commands

// Timers (one second added each time)
const attackFrequency = 20;
const farmFrequency = 305;

var playing = null;

function initRPG(context) {
    var channel = context['msg'].channel;

    if(channel) {
        channel.sendMessage(prefix + "stats");
    }
}

function startRPG(context) {
    var channel = context['msg'].channel;
    
    // Launch farming
    if(channel) {
        playing = setInterval(function() {
            channel.sendMessage(prefix + "mine");
            setTimeout(function() { channel.sendMessage(prefix + "chop"); }, 1000);
            setTimeout(function() { channel.sendMessage(prefix + "forage"); }, 1000);
        }, 5 * 1000 );
    }
}

function stopRPG(context) {
    clearInterval(playing);
}

exports.initrpg = initRPG;
exports.startrpg = startRPG;
exports.stoprpg = stopRPG;
