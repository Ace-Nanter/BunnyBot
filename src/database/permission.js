/**
 * Manage permissions for features in database
 */

const connectionManager = require('.');

/**
 * Get the permissions necessary for a given feature.
 * @param {*} feature Given feature.
 */
var getPermissions = function(feature, callback) {

    var req = `SELECT permission FROM features WHERE nameFeature = ?`;

    // Get connection
    connectionManager.getConnection(function(err, connection) {

        if(err) {
            // If problem getting the connection
            console.log('Error while accessing the database: ' + err);
        }

        // Execute request
        connection.query(req, feature, function (queryError, results) {

            if (queryError) {
                console.log('An error occured: ' + queryError);
                callback(null);
            }
            else {
                callback(results);
            }
        });

        connection.release();
    });
}

exports.getPermissions = getPermissions;