/**
 * Quotes commands : every command related to the quotes.
 */

const reactionsManager = require('../../../database/reactions.js');

/**
 * Command which add a quote on the server it is used.
 * @param {*} context Contains the context of the command
 */
function addReaction(context) {

    var channel = context['msg'].channel;
    var server = context['msg'].guild;
    var args = context['args'];

    if(channel && args && server) {

        // Get trigger
        trigger = args.split(' | ')[0];
        answer = args.split(' | ')[1];

        // Test if everything is ok
        if(trigger && answer && trigger.length > 0 && answer.length > 0) {

            // Check there isn't already a reaction with such a trigger
            if (reactionsManager.reactions[server.id].filter(r => r.trigger === trigger).length <= 0) {
                // Create reaction object
                var reaction = {
                    trigger: trigger,
                    answer: answer,
                    isReply: false,
                    server: server.id
                };

                // Store into the database
                reactionsManager.addReaction(reaction, function(queryError) {
                    if(queryError) {
                        channel.sendMessage("Sorry, something went wrong... :sob:");
                    }
                    else {
                        channel.sendMessage("Reaction added! :smiley:");
                    }
                });
            }
            else {
                channel.sendMessage("Sorry that trigger is already used... :frowning:");
            }
            
        }
        else {
            console.log('Error using command : not enough arguments !')
            channel.sendMessage("Sorry you messed up :sweat_smile:" +
                "\nYou can use this command that way : " +
                "\n+addQuote bunny | I love bunnies !");
        }
    }
    else {
        console.log("Command addQuote : error getting channel");
    }
}

function removeReaction(context) {

    var channel = context['msg'].channel;
    var server = context['msg'].guild;
    var args = context['args'];

    if(channel) {
        if(args && server) {

            // Get reaction to delete
            var reactionToDelete = null;
            var reactions = reactionsManager.reactions[server.id];
            
            if(reactions && reactions.length > 0) {
                // Look if there is one adapted
                reactions.forEach(function(reaction) {
                    if(reaction.trigger === args) {
                        reactionToDelete = reaction;
                    }
                });

                // If we found a reaction
                if(reactionToDelete) {
                    reactionToDelete.server = server.id;

                    reactionsManager.removeReaction(reactionToDelete, function(queryError) {
                        if(queryError) {
                            console.log("There has been a problem : " + queryError);
                            channel.sendMessage("Sorry, something went wrong... :sob:");
                        }
                        else {
                            channel.sendMessage("Reaction deleted! :smiley:");
                        }
                    });
                }
                else {      // Reaction not found
                    console.log("Reaction not found : " + reaction);
                    channel.sendMessage("Sorry, I haven't find that reaction :frowning:");
                }
            }
        }
        else {
            console.log('Error using command : not enough arguments !')
                channel.sendMessage("Sorry you messed up :sweat_smile:" +
                "\nYou can use this command that way : " +
                "\n+quote bunny I love bunnies !");
        }
    }
    else {
        console.log("Command addQuote : error getting channel");
    }
}

exports.addreaction = addReaction;
exports.removereaction = removeReaction;