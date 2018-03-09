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

/**
 * Gives a role to someone
 * @param {*} context 
 */
var giveRole = function(context) {
    
    var bot = context.bot;
    var channel  = context.msg.channel
    var args = context.args.split(' ');

    var guild = context.msg.guild;
    var botMember = guild.members.find(m => m.id === bot.user.id);

    if(args.length == 2) {
        if(botMember != null && !(botMember instanceof Array)
            && botMember.hasPermission("MANAGE_ROLES")) {

            // Find role
            var role = guild.roles.find(r => r.name === args[0]);

            if(role != null) {

                // Find user
                if(context.msg.mentions.users.length > 0) {
                    var userId = context.msg.mentions.users.keys().next().value;
                    var userMember = guild.members.find(m => m.id === userId);

                    // Adding the role
                    userMember.addRole(role);
                }
                else {
                    channel.send("Sorry I can't find your user... :'(");
                }
            }
            else {
                channel.send("Sorry I can't find this role... :'(");
            }
        }
        else {
            channel.send("Sorry I don't have the permission...");
        }
    }
    else {
        channel.send("Not enough arguments!");
    }
}

exports.setgame = setGame;
exports.giverole = giveRole;