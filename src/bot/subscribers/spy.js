/**
 * Create subscribers to react to a part or to a whole message
 */
const subscriptionManager = require('./index.js');
Subscriber = require('./subscriber.js');

const BOT_ID = process.env.BOT_ID;
const TARGET_NAME = process.env.TARGET_GUILD;
const ORIGIN_NAME = process.env.SPIED_GUILD;

var originGuild, targetGuild;

/**
 * Get the target server
 * @param {*} bot 
 */
this.init = function(bot) {
  originGuild = bot.guilds.find(x => x.name === ORIGIN_NAME);
  targetGuild = bot.guilds.find(x => x.name === TARGET_NAME);
}

/**
 * Copy received messages
 * @param {Message} msg Message received
 */
this.copy = function(msg) {
    
  if(msg.author.id !== BOT_ID) {

    var originChannel = msg.channel;
    var targetChannel = targetGuild.channels.find(x => x.name === originChannel.name);

    if(msg.guild === originGuild) {

      // if the channel doesn't exist, create it
      if(!targetChannel) {
        targetGuild.createChannel(originChannel.name, 'text')
        .then(channel => {
          console.log("Created channel " + channel.name);
          
        })
        .catch(console.error);
      }
      else {
        targetChannel.send(msg.author.username + " : " + msg.content);
      }
    }
  }
}

/**
 * Reply to messages
 * @param {Message} msg Message received
 */
this.reply = function(msg) {
    
  if(msg.author.id !== BOT_ID) {

    var originChannel = msg.channel;
    var targetChannel = originGuild.channels.find(x => x.name === originChannel.name);

    // It is coming from the destination server
    if(msg.guild === targetGuild) {

      // if the channel doesn't exist, create it
      if(targetChannel) {
        targetChannel.send(msg.content);
      }
    }
  }
}

/**
 * Initialize subscriber
 * @param {*} bot Bot information
 */
var createSubscriber = function(bot) {

    // Init copying function
    this.init(bot);

    // Part message
    const copyKey = 'spy';
    var copySubscriber = new Subscriber(copyKey, null, null, this.copy);

    const replyKey = 'reply';
    var replySubscriber = new Subscriber(replyKey, null, null, this.reply);

    subscriptionManager.addSubscriber(copyKey, copySubscriber);
    subscriptionManager.addSubscriber(replyKey, replySubscriber);
}

exports.initCopy = createSubscriber;