import { SlashCommandBuilder } from '@discordjs/builders';
import { ApplicationCommandPermissionData, CommandInteraction, OAuth2Guild, Snowflake } from 'discord.js';
import { Bot } from '../../bot';
import { GuildHelper } from '../../utils/guild.helper';
import { BotModule } from './bot-module.model';
import { CommandPermission } from './command-permission.enum';

export abstract class Command {

  module: BotModule;
  abstract name: string;
  abstract description: string;
  abstract slashCommand: SlashCommandBuilder;
  abstract permissions: CommandPermission[];
  abstract execution: (interaction: CommandInteraction) => Promise<void>;

  public constructor(module: BotModule) {
    this.module = module;
  }

  public async buildPermissionsPerGuild(): Promise<Map<Snowflake, ApplicationCommandPermissionData[]>> {

    const permissionsPerGuild: Map<Snowflake, ApplicationCommandPermissionData[]> = new Map();
    const guilds = await Bot.getClient().guilds.fetch();

    for await (const guild of guilds.values()) {

      const userIds: Set<Snowflake> = new Set();

      for await (const permission of this.permissions) {
        const snowflakes = await this.findUsers(permission, guild);
  
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

  private findUsers(permission: CommandPermission, guild: OAuth2Guild): Promise<Snowflake[]> {
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