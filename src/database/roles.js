/**
 * Manage roles in database
 */

const connectionManager = require('.');


var storeRoles = function(roles) {

    var req = `INSERT INTO roles(idRole, roleName, idServer, permissions) VALUES ?
        ON DUPLICATE KEY UPDATE
            roleName    = VALUES(roleName),
            permissions = VALUES(permissions)`;

    // Get connection
    connectionManager.getConnection(function(err, connection) {

        if(err) {
            // If problem getting the connection
            console.log('Error while accessing the database: ' + err);
        }

        query = connection.query(req, [roles], function (queryError) {
            if (queryError) {
                console.log('An error occured: ' + queryError);
            }
            else {
                console.log(roles.length + " roles updated in database.");
            }
        });

        connection.release();
    });
}

exports.storeRoles = storeRoles;