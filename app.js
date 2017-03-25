/**
 * App launching. Launch both bot and website.
 */

// Launch Discord bot
require('./src/bot');


var database = require('./src/database');


console.log(process.env.TEST);