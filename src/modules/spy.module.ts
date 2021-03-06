import { BotModule } from "./common/bot-module";
import { Message, Guild, GuildMember, TextChannel } from "discord.js";
import { Bot } from "../bot";

export class SpyModule extends BotModule {

  private static targetGuild: Guild;
  private static spiedGuild: Guild;

  constructor(params: any) {
    super(params);

    if(params && params['targetGuild'] && params['spiedGuild']) {
      SpyModule.targetGuild = Bot.getClient().guilds.resolve(params['targetGuild']);
      SpyModule.spiedGuild = Bot.getClient().guilds.resolve(params['spiedGuild']);
    }

    this.callbacks = new Map();
    this.callbacks.set('message', SpyModule.onMessageReceived)
  }

  private static onMessageReceived(message: Message) {

    const originChannel = message.channel as TextChannel;

    // Spy
    if(message.author.id !== Bot.getId()) {
      if(message.guild === SpyModule.spiedGuild) {
        const targetChannel = SpyModule.targetGuild.channels.cache.find(c => c.name === originChannel.name) as TextChannel;
        let msgTmp = message;
        msgTmp.content = message.author.username + ' : ' + message.content;

        // Create channel if it doesn't exist
        if(!targetChannel) {
          SpyModule.targetGuild.channels.create(originChannel.name, { type: 'text' }).then(textChannel => {
            textChannel.send(msgTmp);
          });
        }
        else {
          targetChannel.send(msgTmp);
        }
      }
      // Reply
      else if(message.guild === SpyModule.targetGuild) {
        const targetChannel = SpyModule.spiedGuild.channels.cache.find(c => c.name === originChannel.name) as TextChannel;
        
        if(targetChannel) {
          targetChannel.send(message);
        }
      }
    }
  }
}