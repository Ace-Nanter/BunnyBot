/**
 * Wrap every database features.
 */

/* TODO : donne accès à des users, roles, etc...
qui eux même donnent accès aux CRUD sur eux-mêmes.
Le SGBD doit être donné à ce niveau avant la transformation en exports */

var mysql = require('mysql');
var fs = require('fs');

var pool = null;

/**
 * Initialize connection with the database
 */
var init = function() {
    pool = mysql.createPool({
        connectionLimit: 100,
        host: process.env.HOST,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DATABASE_NAME,
        debug: false,
        ssl      : {
            ca  : fs.readFileSync('./resources/ssl/database-ca.pem'), // should be enough for AWS
            key : fs.readFileSync('./resources/ssl/database-key.pem'), // required for google mysql cloud db
            cert: fs.readFileSync('./resources/ssl/database-cert.pem'), // required for google mysql cloud db
        }
    });
}

// Launch init
init();

var getConnection = function(callback) {
    pool.getConnection(function(err, connection) {
        callback(err, connection);
    });
}

var test = function(err, connection) {

    pool.getConnection(function(err, connection) {
        connection.query("SELECT * FROM roles", function(err, rows) {
            connection.release();
            if(!err) {
                console.log(rows);
            }
            else {
                console.log('Error : ' + err);
            }
        });
    });

    
}

exports.init = init;
exports.getConnection = getConnection;
exports.test = test;