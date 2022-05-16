import { ActivityOptions, GuildChannel, GuildMember, Snowflake, TextChannel } from 'discord.js';
import { Bot } from '../../bot';
import { Logger } from '../../logger/logger';
import { BotModule } from "../../models/modules/bot-module.model";
import { LeaveParam } from './leave-param.model';
import { default as SetActivityCommandClass } from './set-activity.command';
import { default as ClearCommandClass } from './clear.command';

export class AdministrationModule extends BotModule {

  private static leaveMessageByGuild: Map<Snowflake, LeaveParam>;

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  constructor(params: any) {
    super();

    if (params) {
      this.init(params);
    }

    this.callbacks = new Map();
    this.callbacks.set('guildMemberRemove', AdministrationModule.onGuildMemberRemoved);

    this.commands = [];
    this.commands.push(new SetActivityCommandClass(this));
    this.commands.push(new ClearCommandClass(this));
  }

  private init(params: any[]): void {
    this.initLeaveMessageParams(params);
    this.initActivity(params);
  }

  /**
   * Initializes bot activity
   * 
   * @param params Parameters containing activity to set
   */
  private initActivity(params: any[]): void {
    const activityParam: { activity: string, options: ActivityOptions } = params['activity'];

    if(activityParam && activityParam.activity) {
      Bot.getClient().user.setActivity(activityParam.activity, activityParam.options);
    }
  }

  /**
   * Initializes parameters for leave messages
   * 
   * @param params Parameters to initialize
   */
  private initLeaveMessageParams(params: any[]): void {
    const leaveParams: any[] = params['leaveMessage'];

    if (!leaveParams || leaveParams.length <= 0) {
      return ;
    }

    AdministrationModule.leaveMessageByGuild = new Map();

    leaveParams.forEach((param: LeaveParam) => {
      AdministrationModule.leaveMessageByGuild.set(param.guildId, param);
    });
  }

  private static async onGuildMemberRemoved(member: GuildMember) {
    const param = AdministrationModule.leaveMessageByGuild.get(member.guild.id);

    if(!param || !param.enabled) {
      return ;
    }

    member.guild.channels.fetch(param.channelId).then((channel: GuildChannel) => {
        if (!channel.isText) {
          Logger.error('Error: defined channel for leave messages is not a text channel!');
          return ;
        }

        const message = param.message.replace('#user#', member.user.username);
        (channel as TextChannel).send(message);
    });
  }
}