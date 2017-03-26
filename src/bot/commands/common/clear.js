/**
 * Clear command : allow user to delete messages.
 */

/**
 * Delete a list of messages
 * @param {*} msgList Message list to delete
 * @param {*} channel Channel on which delete the messages
 */
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


/**
 * Command which delete a given number of messages
 * @param {*} context Contains the context of the command
 */
function clear(context) {

    var channel = context['msg'].channel;
    var args = context['args'];

    if(args && channel) {
        
        // Get message list
        var msgList = channel.messages.findAll('channel', channel);

        // Create a list of messages deletable
        var msgToDelete = (args >= msgList.length - 1) ? msgList
            : msgList.slice(msgList.length - args - 1);

        deleteMessages(msgToDelete, channel);
    }
    else {
        // No args
        channel.sendMessage("You didn't tell me how many messages I should delete !");
    }
}

exports.clear = clear;