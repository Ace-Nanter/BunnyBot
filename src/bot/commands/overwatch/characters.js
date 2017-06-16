/**
 * Commands related to Overwatch
 */

const owManager = require('../../../database/overwatch.js');

/**
 * Assign a character to a user
 * @param {*} context 
 */
function setCharacter(context) {

    var channel = context.msg.channel;
    var user = context.msg.author;

    if(!context.pm) {
        channel.sendMessage('Tell me in private what you play, not here! :wink:');
        return;
    }

    const characters = context.args.split(' ');

    characters.forEach(function(character) {
        owManager.linkCharacter(character, user)
    });
}

function seeCharacter(context) {

}

exports.setowcharacter = setCharacter;
exports.seeowcharacter = seeCharacter;