'use strict'

var deleteMessages = function(msgList, channel) {

    console.log(msgList.length);

    if(msgList.length > 0) {
        // There is still some messages to delete
        var msg = msgList[0];
        if(msg) {
            // Message is defined
            msg.delete().then(function() {
                deleteMessages(msgList.splice(1, msgList.length - 1), channel);
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

    var server = context['msg'].guild;
    var channel = context['msg'].channel;
    var args = context['args'];

    if(args && channel) {
        
        // Get message list
        var msgList = channel.messages.findAll('channel', channel);
        var msgToDelete = (args >= msgList.length - 1) ? msgList 
            :msgList.slice(msgList.length - args - 2, msgList.length - 1);

        deleteMessages(msgToDelete, channel);
    }
    else {
        // No args
        channel.sendMessage("You didn't tell me how many messages I should delete !");
    }
}

exports.clear = clear;