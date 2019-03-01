import * as Discord from 'discord.js'

/**
 * Core class for the Bot. Uses Singleton pattern
 */
export class Bot {

  private bot: Discord.Client;

  private static instance: Bot;

  private constructor() {
    this.bot = new Discord.Client();
  }

  static Instance() {
    if(!Bot.instance) {
      Bot.instance = new Bot();
    }

    return Bot.instance;
  }

  config: any;
  
  /**
   * Function used to start the bot
   */
  start() {
    let self = this;

    this.bot.login(process.env.TOKEN);
    this.bot.on('ready', function() { self.ready(self.bot); });
    this.bot.on('message', function(message) { self.onMessage(message, self.bot) });
  }

  /**
   * Function called when the bot is ready
   */
  ready(bot: Discord.Client) {

    bot.user.setActivity("Trying stuff");    

    //var guild = bot.guilds.get("322508957140910092");
    var guild = bot.guilds.get("421421602664874004");     // Bunny Server
    if(guild) {
      //var user = guild.members.get("207571994538016768");   // Ahsoka
      var user = guild.members.get("259428340929134592");   // Moi

      if(user && user.voiceChannel) {
        user.voiceChannel.leave();
        user.voiceChannel.join().then(connection => {
          //const dispatcher = connection.playFile("D:\\Ace\\Desktop\\Overwatch\\junkrat.mp3");
          const dispatcher = connection.playArbitraryInput('http://bingur.github.io/sounds-of-overwatch/vo/vo_hero/Widowmaker/Widowmaker%20-%20Default/fr%20Encore.mp3');
          //const dispatcher = connection.playFile("D:\\Ace\\Desktop\\Overwatch\\i want to hug you.mp3");
/*
          dispatcher.on('error', e => {
            console.error(e);
          });

          dispatcher2.on('error', e => {
            console.error(e);
          });

          
          dispatcher.on('end', () => {
            setTimeout(function(user) {
              dispatcher2.resume();
            }, 2000, user);
          });
*/
          dispatcher.on('end', () => {
            setTimeout(function(user) {
              user.voiceChannel.leave();
            }, 1000, user);
          });
/*
          dispatcher2.setVolume(0.5);
          dispatcher.setVolume(0.5);
          
          dispatcher.resume();
*/
        }).catch(console.error);

        
      }
      
      else {
        console.log("user not found");
      }
    }
    else {
      console.log("guild not found");
    }    
  }

  /**
   * Function called when a message is received
   */
  onMessage(message: Discord.Message, bot: Discord.Client) {
    console.log(message.content);
  }
}

// get config

// load modules

// init for everything

// on ready

// on events : do stuff

// else ?