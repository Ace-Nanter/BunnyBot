/**
 * App launching. Launch both bot and website.
 */

// Launch Discord bot
require('./src/bot');

// Alexa stuff

var express = require("express");
var alexa = require("alexa-app");

var PORT = process.env.PORT || 8080;
var app = express();

// ALWAYS setup the alexa app and attach it to express before anything else.
var alexaApp = new alexa.app();

alexaApp.express({
  expressApp: app,

  // verifies requests come from amazon alexa. Must be enabled for production.
  // You can disable this if you're running a dev environment and want to POST
  // things to test behavior. enabled by default.
  checkCert: false,

  // sets up a GET route when set to true. This is handy for testing in
  // development, but not recommended for production. disabled by default
  debug: true
});

// now POST calls to /test in express will be handled by the app.request() function
/*
// from here on you can setup any other express routes or middlewares as normal
app.get('/', function(req, res) {
  res.send("Coucou");
});

app.get('/test', function(req, res) {
  res.send("Coucou");
});

*/
alexaApp.launch(function(request, response) {
  response.say("You launched the app!");
});

alexaApp.dictionary = { "names": ["matt", "joe", "bob", "bill", "mary", "jane", "dawn"] };

alexaApp.intent("nameIntent", {
    "slots": { "NAME": "AMAZON.FirstName" },
    "utterances": [
      "my {name is|name's} {names|NAME}", "set my name to {names|NAME}"
    ]
  },
  function(request, response) {
    response.say("Success!");
  }
);

app.listen(PORT);
console.log("Listening on port " + PORT + ", try http://localhost:" + PORT + "/test");
