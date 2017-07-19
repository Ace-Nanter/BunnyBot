/**
 * Create subscribers to react to a part or to a whole message
 */

const reactionsManager = require('../../database/reactions.js');
const subscriptionManager = require('./index.js');
Subscriber = require('./subscriber.js');

const BOT_ID = require('../../../config/config.json')['BOT_ID'];

/**
 * Get reactions from database
 * @param {*} guilds 
 */
this.init = function(guilds) {
    
    guilds.forEach(function(guild) {
        reactionsManager.loadReactions(guild.id);
    });

}

/**
 * React to content into messages
 * @param {Message} msg Message received 
 */
this.partReact = function(msg) {
/*
    var server = msg.guild;
    var reactions = reactionsManager.reactions[msg.guild.id];

    // Get the right selected reaction
    var selectedReaction = null;

    if(reactions && reactions.length > 0) {
        reactions.forEach(function(reaction) {
            if(reaction.trigger === msg.content) {
                selectedReaction = reaction;
            }
        });

        // If we have a reaction, answer
        if(selectedReaction) {
            if(selectedReaction.isReply) {
                msg.reply(selectedReaction.answer);
            }
            else {
                msg.channel.sendMessage(selectedReaction.answer);
            }
        }
    }
    */
}

/**
 * React to full messages
 * @param {Message} msg Message received
 */
this.fullReact = function(msg) {
    
    if(msg.author.id !== BOT_ID) {
        var server = msg.guild;
        var reactions = reactionsManager.reactions[msg.guild.id];

        // Get the right selected reaction
        var selectedReaction = null;

        if(reactions && reactions.length > 0) {
            reactions.forEach(function(reaction) {
                if(reaction.trigger === msg.content) {
                    selectedReaction = reaction;
                }
            });

            // If we have a reaction, answer
            if(selectedReaction) {
                if(selectedReaction.isReply) {
                    msg.reply(selectedReaction.answer);
                }
                else {
                    msg.channel.sendMessage(selectedReaction.answer);
                }
            }
        }
    }
}

/**
 * Initialize subscribers
 * @param {*} guilds Guilds for which initializing subscribers
 */
var createSubscribers = function(guilds) {

    // Init reactions
    this.init(guilds);

    // Part message
    const keyPart = 'reactPart';
    var subscriberPart = new Subscriber(keyPart, null, null, this.partReact);

    // Full message
    const keyFull = 'reactFull';
    var subscriberFull = new Subscriber(keyFull, null, null, this.fullReact);
    
    subscriptionManager.addSubscriber(keyPart, subscriberPart);
    subscriptionManager.addSubscriber(keyFull, subscriberFull);
}

exports.initReactions = createSubscribers;