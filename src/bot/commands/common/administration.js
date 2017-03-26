/**
 * Administration commands
 */



/**
 * Defines the game the bot is playing
 * @param {*} context Context of the command
 */
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
exports.setgame = setGame;