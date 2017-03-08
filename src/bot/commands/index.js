/**
 * Look for commands file and export commands array
 */

var fs = require('fs');
var path = require('path');

var lookForCommands = function (dir, regExcludes, done) {

  var results = {};

  fs.readdir(dir, function (err, list) {

    // Error occured
    if (err) return done(err);

    var pending = list.length;
    if (!pending) return done(null, results);

    list.forEach(function (file) {
      
      var excluded = false;

      // Exclude files we do not want
      for(var i = 0; i < regExcludes.length ; i++) {
        if (file.match(regExcludes[i])) 
          excluded = true;
      }

      // Get full path
      file = path.join(dir, file);

      // Add if not in regExcludes
      if(excluded === false) {

        // Check if its a folder
        fs.stat(file, function (err, stat) {
          if (stat && stat.isDirectory()) {

            // If it is, walk again
            lookForCommands(file, regExcludes, function (err, res) {
              for(var key in res) {
                results[key] = res[key];
              }

              if (!--pending) { done(null, results); }

            });
          } else {

            // Add it to results
            var obj = require(file);
            for(var key in obj) {
              results[key] = obj[key];
            }

            if (!--pending) { done(null, results); }

          }
        });
      }
      else {
        // if excluded just down the counter
        if (!--pending) { done(null, results);}
      }
    });
  });
};

// Files to exclude
var regExcludes = [/index.js/g];

var DIR = path.join(__dirname, 'src', 'bot', 'commands');
lookForCommands(__dirname, regExcludes, function(err, results) {
  if (err) {
    throw err;
  }

  exports.commands = results;
});

