/** This file provides methods to manage permissions */

var checkPermissions = function( feature, user ) {

    // Get permissions required for feature
    // If permissions not found ==> error

    // Look for user in database
    // If user is present
        // Look for user roles
        // If there are roles
            // Check it is ok
        // Else
            // error
    // If there is no user
        // Compare Discord and feature permissions

}

exports.checkPermissions = checkPermissions;