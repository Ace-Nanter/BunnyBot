import { Snowflake } from 'discord.js';

export class LeaveParam {

  public constructor(
    public guildId: Snowflake,
    public channelId: Snowflake,
    public enabled: true,
    public message: string
  ) { }
}