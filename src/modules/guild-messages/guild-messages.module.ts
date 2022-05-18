import { Channel, Guild, GuildMember, TextChannel } from 'discord.js';
import { Bot } from '../../bot';
import { Logger } from '../../logger/logger';
import { BotModule } from '../../models/bot-module.model';
import { GuildMessage, GuildMessageType, IGuildMessage } from './models/guild-messages.model';

export class GuildMessagesModule extends BotModule {

  private guild: Guild;
  
  protected initCallbacks(): void {
    this.callbacks = new Map();
    this.callbacks.set('guildMemberAdd', (member: GuildMember) => { this.onGuildMemberAdded(member) });
    this.callbacks.set('guildMemberRemove', (member: GuildMember) => { this.onGuildMemberRemoved(member); });
  }

  protected initCommands(): void {
    return ;
  }

  protected async initModule(): Promise<void> {
    if (!this.guildId) {
      Logger.error('Error: module "Guild Messages" does not have an associated guild ID!');
    }

    Bot.getClient().guilds.fetch(this.guildId).then((guild: Guild) => this.guild = guild);
  }

  private async onGuildMemberAdded(member: GuildMember): Promise<void> {
    const messages = await this.retrieveMessages(GuildMessageType.JOINING);
    messages.forEach(message => this.sendMessage(message, member));
  }

  private async onGuildMemberRemoved(member: GuildMember) {
    const messages = await this.retrieveMessages(GuildMessageType.LEAVING);
    messages.forEach(message => this.sendMessage(message, member));
  }

  /**
   * Retrieves all messages for the current guild and for given type
   * 
   * @param type Given type of messages which should be retrieved
   * @returns A promise containing a list of guild messages
   */
  private async retrieveMessages(type: GuildMessageType): Promise<IGuildMessage[]> {
    return GuildMessage.find({ guildId: this.guildId, type: type }).then(messages => {
      return Promise.resolve(messages);
    }).catch((error) => {
      return Promise.reject(error);
    });
  }

  /**
   * Sends the message stored in database on the appropriate channel
   * 
   * @param message Message parameters retrieved in the database
   * @param member GuildMember concerned by the event which triggered message sending
   * @returns A promise which ends at the end of the operation
   */
  private async sendMessage(message: IGuildMessage, member?: GuildMember): Promise<void> {
    try {
      const channel: Channel = await this.guild.channels.fetch(message.channelId);

      if (!channel || !channel.isText()) {
        Logger.warn('Error: given channel does not exist or is not a text channel!');
      }

      // TODO : to improve
      const messagePayload: string = message.message.replace('#user#', member.user.username);
      (channel as TextChannel).send(messagePayload);
    } catch(error) {
      Logger.error(error);
    }

    return Promise.resolve();
  }
}