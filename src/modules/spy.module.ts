import { CategoryChannel, Guild, Message, TextChannel } from "discord.js";
import { Bot } from "../bot";
import { BotModule } from "../models/bot-module.model";

export class SpyModule extends BotModule {

  private targetGuild: Guild;
  private spiedGuild: Guild;
  private category: CategoryChannel;

  protected initCallbacks(): void {
    this.callbacks.set('messageCreate', (message: Message) => { this.onMessageReceived(message) })
  }

  protected initCommands(): void {
    return ;
  }

  public async initModule(params: any[]): Promise<void> {
    if(params && params['targetGuild'] && params['spiedGuild']) {
      this.targetGuild = await Bot.getClient().guilds.fetch(params['targetGuild']);
      this.spiedGuild = await Bot.getClient().guilds.fetch(params['spiedGuild']);
      await Bot.getClient().channels.fetch(params['categoryId']).then(channel => {
        if (channel && channel instanceof CategoryChannel) {
          this.category = (channel as CategoryChannel);
        }
      });
    }
  }

  private onMessageReceived(message: Message) {

    const originChannel = message.channel as TextChannel;

    // Spy
    if(message.author.id !== Bot.getId()) {
      if(message.guild === this.spiedGuild) {
        const targetChannel = this.targetGuild.channels.cache.find(c => c.name === originChannel.name) as TextChannel;
        const msgTmp = `${message.author.username} : ${message.content}`;

        // Create channel if it doesn't exist
        if(!targetChannel) {
          this.category.createChannel(originChannel.name, { type: 'GUILD_TEXT' }).then(textChannel => {
            textChannel.send(msgTmp);
          });
        }
        else {
          targetChannel.send(msgTmp);
        }
      }
      // Reply
      else if(message.guild === this.targetGuild) {
        const targetChannel = this.spiedGuild.channels.cache.find(c => c.name === originChannel.name) as TextChannel;
        
        if(targetChannel) {
          targetChannel.send(message.content);
        }
      }
    }
  }
}