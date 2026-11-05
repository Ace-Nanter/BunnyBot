import { CategoryChannel, Guild, PermissionsBitField, ChannelType, Role, Snowflake, TextChannel } from "discord.js";
import { IGame } from "../models/game.model";

export class GamesRolesService {

  constructor(
    protected readonly guild: Guild,
    protected readonly gameCategory: CategoryChannel
  ) { }

  /**
   * Creates a role for a given game
   * 
   * @param game Game for which role should be created
   * @returns Created role in a promise
   */
  protected createRole(game: IGame): Promise<Role> {
    return this.guild.roles.create({ name: game.gameName });
  }

  /**
   * Creates a channel by default for a given game
   * @param game Game for which channel should be created
   * @param roleId Role created for this channel which should be the only one to have access to the channel
   * @returns Created text channel in a promise
   */
  protected createChannel(game: IGame, roleId: Snowflake): Promise<TextChannel> {
    const channelName = game.gameName.replace(/[^a-zA-Z0-9 ]/g, "").toLowerCase().replace(/\s/g, '-');
    const everyoneRole = this.guild.roles.everyone;

    return this.guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: this.gameCategory,
      permissionOverwrites: [
        {
          id: everyoneRole.id,
          deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
        },
        {
          id: roleId,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
        }
      ]
    });
  }
}