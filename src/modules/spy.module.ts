import { Guild, Message, TextChannel } from "discord.js";
import { Bot } from "../bot";
import { BotModule } from "../models/modules/bot-module.model";

export class SpyModule extends BotModule {

  private static targetGuild: Guild;
  private static spiedGuild: Guild;

  constructor(params: unknown) {
    super();

    if(params && params['targetGuild'] && params['spiedGuild']) {
      SpyModule.targetGuild = Bot.getClient().guilds.resolve(params['targetGuild']);
      SpyModule.spiedGuild = Bot.getClient().guilds.resolve(params['spiedGuild']);
    }

    this.callbacks = new Map();
    this.callbacks.set('messageCreate', SpyModule.onMessageReceived)
  }

  private static onMessageReceived(message: Message) {

    const originChannel = message.channel as TextChannel;

    // Spy
    if(message.author.id !== Bot.getId()) {
      if(message.guild === SpyModule.spiedGuild) {
        const targetChannel = SpyModule.targetGuild.channels.cache.find(c => c.name === originChannel.name) as TextChannel;
        const msgTmp = `${message.author.username} : ${message.content}`;

        // Create channel if it doesn't exist
        if(!targetChannel) {
          SpyModule.targetGuild.channels.create(originChannel.name, { type: 'GUILD_TEXT' }).then(textChannel => {
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
          targetChannel.send(message.content);
        }
      }
    }
  }
}