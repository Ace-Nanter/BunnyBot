import { GuildMember, MessageReaction, Role, Message, Guild, TextChannel, User, Snowflake } from "discord.js";
import { Bot } from "../bot";
import { Logger } from "../logger/logger";
import { BotModule } from "../models/bot-module.model";

const ROLE_ID = 'roleId';
const REACTION_NAME = 'reactionName';
const GUILD_ID = 'guildId';
const CHANNEL_ID = 'channelId';
const MESSAGE_ID = 'messageId';

export class NewRoleModule extends BotModule {

  private static guildId: Snowflake;
  private static role: Role;
  private static message: Message;
  private static reactionName: string;

  protected initCallbacks(): void {
    this.callbacks.set('guildMemberAdd', NewRoleModule.onGuildMemberAdd);
    this.callbacks.set('messageReactionAdd', NewRoleModule.onMessageReactionAdded);
    this.callbacks.set('messageReactionRemove', NewRoleModule.onMessageReactionRemoved);
  }

  protected initCommands(): void {
    return ;
  }

  public async initModule(params: any[]): Promise<void> {
    if (params) {

      let guild: Guild = null;
      let role: Role = null;
      let message: Message = null;

      // Get Role
      if (params[GUILD_ID] && params[ROLE_ID]) {
        guild = Bot.getClient().guilds.resolve(params[GUILD_ID])
        role = await guild.roles.fetch(params[ROLE_ID]);

        NewRoleModule.guildId = guild.id;
      }

      // Get message
      if (guild && params[CHANNEL_ID] && params[MESSAGE_ID]) {
        const channel = guild.channels.resolve(params[CHANNEL_ID]);
        if (channel.isText) {
          try {
            message = await (channel as TextChannel).messages.fetch(params[MESSAGE_ID]);
          }
          catch (e) {
            Logger.error(`NewComerModule: Unable to find message to watch: ${e}`);
          }
        }
      }

      if (guild && message && role && params[REACTION_NAME]) {
        NewRoleModule.message = message;
        NewRoleModule.role = role;
        NewRoleModule.reactionName = params[REACTION_NAME];

        if (message && !message.reactions.cache.find(r => r.emoji.name === params[REACTION_NAME])) {
          message.react(params[REACTION_NAME]);
        }
      }
      else {
        Logger.warn('Something wrong happened while initializing NewRoleModule!');
      }
    }
  }

  private static onGuildMemberAdd(member: GuildMember) {
    if (member.guild.id === NewRoleModule.guildId && member.user.id !== Bot.getId()) {
      Logger.info(`${member.user.username} joined ${member.guild.name}!`);
      if (NewRoleModule.role) {
        member.roles.add(NewRoleModule.role);
      }
    }
  }

  private static onMessageReactionAdded(messageReaction: MessageReaction, user: User) {
    if (user.id !== Bot.getId() && messageReaction.message.id === NewRoleModule.message.id && messageReaction.emoji.name === NewRoleModule.reactionName) {
      messageReaction.message.guild.members.fetch(user).then((member) => {
        member.roles.remove(NewRoleModule.role).catch(Logger.error);
      }).catch(Logger.error);
    }
  }

  private static onMessageReactionRemoved(messageReaction: MessageReaction, user: User) {
    if (user.id !== Bot.getId() && messageReaction.message.id === NewRoleModule.message.id && messageReaction.emoji.name === NewRoleModule.reactionName) {
      messageReaction.message.guild.members.fetch(user).then((member) => {
        member.roles.add(NewRoleModule.role).catch(Logger.error);
      }).catch(Logger.error);
    }
  }
}