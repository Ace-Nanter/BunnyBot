import * as Discord from 'discord.js'
import * as mongo from 'mongodb'
import { exists } from 'fs';

/**
 * Core class for the Bot. Uses Singleton pattern
 */
export class BotCore {

  // Singleton instance
  private static instance: BotCore;

  // Attributes
  private bot: Discord.Client;
  private db: any;
  
  /**
   * Default private constructor
   */
  private constructor() {
    this.bot = new Discord.Client();
  }

  static Instance() {
    if(!BotCore.instance) {
      BotCore.instance = new BotCore();
    }

    return BotCore.instance;
  }

  config: any = { PREFIX: "+" };
  
  /**
   * Function used to start the bot
   */
  async start() {
    let self = this;

    await this.connectToDb();

    if(this.db) {
      await this.getConfig();

      if(this.config) {
        this.bot.login(process.env.TOKEN);
        this.bot.on('ready', function() { self.ready(self.bot); });
        this.bot.on('message', function(message) { self.onMessage(message, self.bot) });
      }
    }
    else {
      process.exit(-1);
    }
  }

  /**
   * Connects to the database
   */
  private async connectToDb() {

    try {
      const client = await mongo.MongoClient.connect('' + process.env.DATABASE_URI, { useNewUrlParser: true });
      this.db = client.db(process.env.DB_NAME);
    }
    catch(e) {
      console.error(e);
    }
  }

  /**
   * Get configuration in database
   */
  async getConfig() {

    var self = this;

    await this.db.collection('config').find().toArray(function(err: any, configs: any[]) {
      if(err) {
        console.error('No configuration found!');
      }
      else {
        if(configs && configs.length > 0) self.config = configs[0];
      }
    });
  }

  /**
   * Function called when the bot is ready
   */
  ready(bot: Discord.Client) {
    console.log('Bot ready');
    console.log(this.config);
  }

  /**
   * Function called each time a message is received
   * @param msg Message received
   * @param bot Link to the bot client
   */
  onMessage(msg: Discord.Message, bot: Discord.Client) {

    // If a command has been called
    if(msg.content[0] === this.config.PREFIX) {
      
      console.log("This is a command!");

      /*
      // Get command name
      const commandName = msg.content.split(' ')[0].substring(1).toLowerCase();

      // Get command
      const command = commands.lookForCommand(commandName);

      if(command) {
          console.log('Command called: ' + commandName);

          // Get context
          const context = 
          {
              msg: msg,
              bot: bot,
              pm: msg.channel.type === 'dm',
              args: msg.content.substring(commandName.length + 2)
          };

          commands.executeCommand(command, commandName, context);
          
      }
      else {
          // Command doesn't exist
          console.log('No command found !');
          //msg.channel.sendMessage('Sorry I can\'t understand what you mean ! :worried:');
      }*/
  }
  else {
      // React to content
      //subscriptionManager.react(msg);
      console.log("Reaction should be here");
    }
  }
}

// get config

// load modules

// init for everything

// on ready

// on events : do stuff

// else ?