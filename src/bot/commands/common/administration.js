'use strict'

var deleteMessages = function(msgList, channel) {

    console.log(msgList.length);

    if(msgList.length > 0) {
        // There is still some messages to delete
        var msg = msgList[msgList.length - 1];
        if(msg) {
            // Message is defined
            msg.delete().then(function() {
                deleteMessages(msgList.slice(0, -1), channel);
            })
            .catch(function(error) {
                // Delete request has failed
                if(error && error.status == 403) {
                    // Permission error
                    channel.sendMessage('Sorry, the administrator of this server doesn\'t want me to do that... :sweat_smile:');
                }
                else {
                    // Other type of errors
                    console.log(error);
                    channel.sendMessage('Sorry, an error has occured... :sob:');
                }
            });
        }
    }
    else {
        // No message left to delete
        console.log('Messages have been deleted');
    }
}


// Delete the number asked of messages on the channel
function clear(context) {

    var channel = context['msg'].channel;
    var args = context['args'];

    // TODO : test for roles

    if(args && channel) {
        
        // Get message list
        var msgList = channel.messages.findAll('channel', channel);
        var msgToDelete = (args >= msgList.length - 1) ? msgList 
            :msgList.slice(msgList.length - args - 2, msgList.length - 1);
console.log(msgToDelete[0]);
        deleteMessages(msgToDelete, channel);
    }
    else {
        // No args
        channel.sendMessage("You didn't tell me how many messages I should delete !");
    }
}

var setGame = function(context) {

    var bot = context['bot'];
    var args = context['args'];

    // TODO : test for authorization

    if(bot && args) {
        if(args === 'null') {
            bot.user.setGame(null);
            console.log('Bot stopped playing');
        }
        else {
            bot.user.setGame(args);
            console.log('Bot game set at: ' + args);
        }
        
    }
}

exports.setGame = setGame;

//exports.clear = clear;    TODO : to re enable