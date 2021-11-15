import { SlashCommandBuilder } from '@discordjs/builders';
import { ApplicationCommandPermissionData, Interaction, OAuth2Guild, Snowflake } from 'discord.js';
import { Bot } from '../../bot';
import { GuildHelper } from '../../utils/guild.helper';
import { CommandPermission } from './command-permission.enum';

export class Command {
  constructor(
    public slashCommand: SlashCommandBuilder,
    public permissions: CommandPermission[],
    public execution: ((interaction: Interaction) => void)
  ) { }

  public static async buildPermissionsPerGuild(command: Command): Promise<Map<Snowflake, ApplicationCommandPermissionData[]>> {

    const permissionsPerGuild: Map<Snowflake, ApplicationCommandPermissionData[]> = new Map();
    const guilds = await Bot.getClient().guilds.fetch();

    for await (const guild of guilds.values()) {

      const userIds: Set<Snowflake> = new Set();

      for await (const permission of command.permissions) {
        const snowflakes = await Command.findUsers(permission, guild);
  
        for(const snowflake of snowflakes) {
          userIds.add(snowflake);
        }
      }

      const permissions: ApplicationCommandPermissionData[] = Array.from(userIds.values()).map(userId => {
        return { id: userId, type: 'USER', permission: true };
      });
      permissionsPerGuild.set(guild.id, permissions);      
    }

    return permissionsPerGuild;
  }

  private static findUsers(permission: CommandPermission, guild: OAuth2Guild): Promise<Snowflake[]> {
    switch (permission) {
      case (CommandPermission.OWNER): 
        return Promise.resolve([process.env.OWNER_ID]);
      case (CommandPermission.GUILD_OWNER):
        return GuildHelper.findGuildOwner(guild);
      case (CommandPermission.ADMIN):
        return GuildHelper.findAdmins(guild);
      case (CommandPermission.EVERYONE || CommandPermission.MODERATOR):
        return Promise.resolve([]);
    }
  }
}