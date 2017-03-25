/**
 * Wrap every database features.
 */

/* TODO : donne accès à des users, roles, etc...
qui eux même donnent accès aux CRUD sur eux-mêmes.
Le SGBD doit être donné à ce niveau avant la transformation en exports */

var mysql = require('mysql');
var fs = require('fs');

var pool = null;

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

var test = function() {
    pool.getConnection(function(err, connection) {
        if(err) {
            console.log('Error :' + err);
        }

        connection.query("SELECT * FROM users", function(err, rows) {
            connection.release();
            if(!err) {
                console.log(rows);
            }
            else {
                console.log('Error : ' + err);
            }
        })
    })
}

exports.init = init;
exports.test = test;