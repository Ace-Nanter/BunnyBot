import { Message } from "discord.js";
import { Logger } from "../../../logger/logger";
import { IMessageStats, MessageStats } from "../models/message-stats.model";

export class MessageStatsUtils {

  public static async manageMessage(message: Message): Promise<void> {
    if (!message.guildId) {
      return; 
    }

    const messageStat: IMessageStats = await MessageStats.findOrCreateByGuildIdAndDate(message.guildId, message.createdAt);

    if (!messageStat) {
      Logger.error(`Error: unable to retrieve stats for messages for guild ${message.guildId} at date ${message.createdAt}`);
      return ;
    }

    messageStat.total++;
    MessageStatsUtils.manageMessageMember(messageStat, message);
    MessageStatsUtils.manageMessageRoles(messageStat, message);
    MessageStatsUtils.manageMessagesChannels(messageStat, message);

    
    await messageStat.save();
  }

  private static manageMessageMember(messageStat: IMessageStats, message: Message): void {
    const member = messageStat.members.find(m => m.userId === message.author.id);

    if (!member) {
      messageStat.members.push({
        userId: message.author.id,
        messages: 1
      });
    } else {
      member.messages++;
    }
  }

  private static manageMessageRoles(messageStat: IMessageStats, message: Message): void {
    
    // Message hasn't been sent by a member of a guild (webhook or other)
    if (!message.member) {
      return;
    }

    message.member.roles.cache.forEach(role => {
      const roleStat = messageStat.roles.find(r => r.roleId === role.id);

      if (!roleStat) {
        messageStat.roles.push({
          roleId: role.id,
          messages: 1
        })
      } else {
        roleStat.messages++;
      }
    });
  }

  private static manageMessagesChannels(messageStat: IMessageStats, message: Message): void {

    const channel = messageStat.channels.find(c => c.channelId === message.channelId);

    if (!channel) {
      messageStat.channels.push({
        channelId: message.channelId,
        messages: 1
      });
    } else {
      channel.messages++;
    }
  }
}