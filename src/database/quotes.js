/**
 * Manage quotes with triggers and answers in database
 */

const connectionManager = require('.');

var getQuotes = function(server, callback) {

    var req = `SELECT trigger, answer, isReply FROM quotes WHERE server = ?`;

    // Get connection
    connectionManager.getConnection(function(err, connection) {

        if(err) {
            // If problem getting the connection
            console.log('Error while accessing the database: ' + err);
        }

        // Execute request
        connection.query(req, server, function (queryError, results) {
            if(querryError) {
                console.log('An error occured: ' + querryError);
                callback(null);
            }
            else {
                callback(results);
            }
        });

        connection.release();
    });
}

var addQuote = function(quote) {
    var req = "INSERT INTO quotes(`trigger`, answer, server, isReply) VALUES(?,?,?,?)";

    // Get connection
    connectionManager.getConnection(function(err, connection) {

        if(err) {
            // If problem getting the connection
            console.log('Error while accessing the database: ' + err);
        }

        // Execute request
        var args = [quote.trigger, quote.answer, quote.server, quote.isReply];
        connection.query(req, args, function (queryError, results) {
            if(queryError) {
                console.log('An error occured: ' + queryError);
            }
        });

        connection.release();
    });

}

exports.getQuotes = getQuotes;
exports.addQuote = addQuote;