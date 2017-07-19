/**
 * Manage reactions with triggers and answers in database
 */
const connectionManager = require('.');

var reactions = [];

var loadReactions = function(server) {

    var req = "SELECT `trigger`, answer, isReply FROM reactions WHERE server = ?";

    // Get connection
    connectionManager.getConnection(function(err, connection) {

        if(err) {
            // If problem getting the connection
            console.log('Error while accessing the database: ' + err);
        }

        // Execute request
        connection.query(req, server, function (queryError, rows) {
            if(queryError) {
                console.log('An error occured: ' + queryError);
            }
            else {
                if(rows && rows.length) {
                    reactions[server] = rows;
                }
            }
        });

        console.log('Reactions loaded for guild ' + server);

        connection.release();
    });
}

var addReaction = function(reaction, callback) {

    var req = "INSERT INTO reactions(`trigger`, answer, server, isReply) VALUES(?,?,?,?)";

    // Get connection
    connectionManager.getConnection(function(err, connection) {

        if(err) {
            // If problem getting the connection
            console.log('Error while accessing the database: ' + err);
        }

        // Execute request
        var args = [reaction.trigger, reaction.answer, reaction.server, reaction.isReply];
        connection.query(req, args, function (queryError, rows) {
            if(queryError) {
                console.log('An error occured: ' + queryError);
                callback(queryError);
            }
            else {
                loadReactions(reaction.server);
                callback(null);
            }
        });

        connection.release();
    });
}

var removeReaction = function(reaction, callback) {

    var req = "DELETE FROM reactions WHERE `trigger` = ? AND server = ?";
    
    // Get connection
    connectionManager.getConnection(function(err, connection) {

        if(err) {
            // If problem getting the connection
            console.log('Error while accessing the database: ' + err);
        }

        // Execute request
        var args = [reaction.trigger, reaction.server];
        connection.query(req, args, function (queryError, rows) {
            if(queryError) {
                console.log('An error occured: ' + queryError);
                callback(queryError);
            }
            else {
                loadReactions(reaction.server);
                callback(null);
            }
        });

        connection.release();
    });
}

exports.loadReactions = loadReactions;
exports.addReaction = addReaction;
exports.removeReaction = removeReaction;
exports.reactions = reactions;