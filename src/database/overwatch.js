/**
 * Operate the database operations for everything related to Overwatch features
 */

const connectionManager = require('.');

/**
 * Assign a character to a user in the database
 * @param {*} character Given character to assign
 * @param {*} user Given user to link with the character
 */
function linkCharacter(character, user) {
    console.log(character);
}

exports.linkCharacter = linkCharacter;