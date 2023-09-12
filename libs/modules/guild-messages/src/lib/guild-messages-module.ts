import { Logger } from '@BunnyBot/logger';
import { BotModule } from '@BunnyBot/modules/base';
import { Channel, ChannelType, Guild, GuildMember, PartialGuildMember, TextChannel } from 'discord.js';
import { GuildMessage, GuildMessageType, IGuildMessage } from './models/guild-messages';

export class GuildMessagesModule extends BotModule {
  private guild: Guild | undefined;

  protected initCallbacks(): void {
    this.callbacks = {};
    this.callbacks.guildMemberAdd = (member: GuildMember) => {
      this.onGuildMemberAdded(member);
    };
    this.callbacks.guildMemberRemove = (member: GuildMember | PartialGuildMember) => {
      this.onGuildMemberRemoved(member);
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function, class-methods-use-this
  protected initCommands(): void {}

  protected async initModule(): Promise<void> {
    if (!this.guildId) {
      return Promise.reject(new Error('Error: module "Guild Messages" does not have an associated guild ID!'));
    }

    this.guild = await this.client.guilds.fetch(this.guildId);
    return Promise.resolve();
  }

  private async onGuildMemberAdded(member: GuildMember): Promise<void> {
    const messages = await this.retrieveMessages(GuildMessageType.JOINING);
    messages.forEach((message) => this.sendMessage(message, member));
  }

  private async onGuildMemberRemoved(member: GuildMember | PartialGuildMember) {
    const messages = await this.retrieveMessages(GuildMessageType.LEAVING);

    if (member instanceof GuildMember) {
      messages.forEach((message) => this.sendMessage(message, member));
    }
  }

  /**
   * Retrieves all messages for the current guild and for given type
   *
   * @param type Given type of messages which should  be retrieved
   * @returns A promise containing a list of guild messages
   */
  private async retrieveMessages(type: GuildMessageType): Promise<IGuildMessage[]> {
    return GuildMessage.find({ guildId: this.guildId, type })
      .then((messages) => Promise.resolve(messages))
      .catch((error) => Promise.reject(error));
  }

  /**
   * Sends the message stored in database on the appropriate channel
   *
   * @param message Message parameters retrieved in the database
   * @param member GuildMember concerned by the event which triggered message sending
   * @returns A promise which ends at the end of the operation
   */
  private async sendMessage(message: IGuildMessage, member: GuildMember): Promise<void> {
    if (!this.guild) {
      return Promise.resolve();
    }

    try {
      const channel: Channel | null = await this.guild.channels.fetch(message.channelId);

      if (!channel || channel.type !== ChannelType.GuildText) {
        Logger.warn('Error: given channel does not exist or is not a text channel!');
      }

      const messagePayload: string = message.message.replace('#user#', member.user.username);
      (channel as TextChannel).send(messagePayload);
    } catch (error) {
      Logger.error(`${error}`);
    }

    return Promise.resolve();
  }
}

export default GuildMessagesModule;
