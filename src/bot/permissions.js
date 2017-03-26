/** This file provides methods to manage permissions */

const permissionManager = require('../database/permission.js')
const ownerId = require('../../config/config.json')['OWNER_ID'];

/**
 * Verify that a given member can use a given feature of the bot.
 * @param {*} feature Feature you want to access
 * @param {*} member Member of a server who want to access to the feature
 */
var checkPermissions = function( feature, member, callback ) {

    permissionManager.getPermissions(feature, function(results) {
        if(results && results.length == 1) {
            // There is only one permission : it is ok.
            var permission = results[0].permission;

            if(permission === 0) {
                // TODO : improve this part
                callback(member.user.id === ownerId);
            }
            else {
                // Return is user is authorized or not
                callback(member.hasPermission(permission));
            }

            
        }
        else if(results.length > 1) {
            // Several permissions has been found
            console.log('Error: several permissions found!');

            // Return false by default
            callback(false);
        }
        else {
            // No permission has been found
            console.log('Error: no permissions found for command ' + feature + '!');

            // Return false
            callback(false);
        }
    });
}
exports.checkPermissions = checkPermissions;