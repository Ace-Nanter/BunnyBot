/**
 * Quotes commands : every command related to the quotes.
 */

const quotesManager = require('../../../database/quotes.js');

/**
 * Command which add a quote on the server it is used.
 * @param {*} context Contains the context of the command
 */
function addQuote(context) {

    var channel = context['msg'].channel;
    var server = context['msg'].guild;
    var args = context['args'];

    if(channel) {
        if(args && server) {

            // Get trigger
            trigger = args.split('|')[0];

            // Get answer : remove the trigger + the space between
            answer = args.substring(trigger.length + 1);

            // Test if everything is ok
            if(trigger && answer && trigger.length > 0 && answer.length > 0) {

                // Create quote object
                var quote = {
                    trigger: trigger,
                    answer: answer,
                    isReply: false,
                    server: server.id
                };

                // Store into the database
                quotesManager.addQuote(quote);
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

exports.addquote = addQuote;