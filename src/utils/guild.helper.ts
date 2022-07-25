import { OAuth2Guild, Snowflake } from "discord.js";
import { Bot } from "../bot";

export class GuildHelper {

  /**
   * Finds owner of given guild
   * 
   * @param guild Given guild for which owner should be found
   * @returns Guild owner
   */
  public static async findGuildOwner(guild: OAuth2Guild): Promise<Snowflake[]> {
    return Bot.getClient().guilds.fetch(guild.id).then((foundGuild) => {
      return [foundGuild.ownerId];
    });
  }
  
  /**
   * Finds all administrators of given guild
   * 
   * @param guild Given guild for which administrators should be found
   * @returns Guild administrators ids
   */
  public static async findAdmins(guild: OAuth2Guild): Promise<Snowflake[]> {
    return Bot.getClient().guilds.fetch(guild.id).then((foundGuild) => {
      return foundGuild.roles.fetch().then(roles => {
        const userIds = [];

        roles.filter(role => role.permissions.has("Administrator")).forEach(role => {
          role.members.forEach(member => { 
            userIds.push(member.id);
          }); 
        });

        return userIds;
      });
    });
  }
}