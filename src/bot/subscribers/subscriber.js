/**
 * Subscriber object
 */

/**
 * Object Subscriber : initialized with its associated action
 * @param {string} key Key of the subscriber
 * @param {*} init Initialisation method for the subscriber
 * @param {*} end Method triggered when subscriber will be destroyed
 * @param {*} action Action of the subscriber when called
 */
var Subscriber = function(key, init, end, action) {
    this.key = key;
    this.action = action;
    this.init = init;
    this.end = end;
}

/**
 * Initialisation of the subscriber
 * @param {*} args Arguments for the initialisation
 */
Subscriber.prototype.init = function(args) {
    if(this.init != null) {
        init();
    }
}

/**
 * Method triggered before the destruction of the subscriber
 * @param {*} args Arguments for the 
 */
Subscriber.prototype.end = function(args) {
    if(this.end != null) {
        end();
    }
}

/**
 * Call the action of the subscriber
 * @param {*} args Arguments for the call
 */
Subscriber.prototype.call = function(args) {
    
    if(this.action != null) {
        this.action(args);
    }
    else {
        console.log("Error : Subscriber " + this.key + "doesn't have any action");
    }
}

module.exports = Subscriber;