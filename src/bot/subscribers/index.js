/**
 * Contains subscribers which analyze every message on the Discord
 */

/**
 * Tells how many subscribers we have
 */
var count = 0;

/**
 * Contains subscribers
 */
var subscribers = [];

/**
 * Add a subscriber with a given key
 * @param {string} key Key of the subscriber
 * @param {*} subscriber Subscriber object
 */
var addSubscriber = function(key, subscriber) {
    subscribers[key] = subscriber;

    // If the subscribe needs to initialize something
    if(subscriber.init != null) {
        subscriber.init();
    }

    count++;
}

/**
 * Remove a subscriber using his key
 * @param {*} key Key of the subscriber to delete
 */
var removeSubscriber = function(key) {
    subscribers[key] = null;

    // If the subscriber needs to do something before ending
    if(subscriber.end != null) {
        subscriber.end();
    }

    count--;
}

/**
 * React to a message
 * @param {Message} msg 
 */
var react = function(msg) {
    for(var key in subscribers) {
        var subscriber = subscribers[key];

        subscriber.call(msg);
    }
}

exports.addSubscriber = addSubscriber;
exports.removeSubscriber = removeSubscriber;
exports.count = count;
exports.react = react;