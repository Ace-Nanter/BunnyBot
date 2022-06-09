import { Activity, Collection, Guild, GuildMember, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { Logger } from '../../../logger/logger';
import { Bot } from '../../../bot';
import { Game, IGame } from '../models/game.model';
import { IGuildGame } from '../models/guild-game.model';

export class ActivityScanner {

  private static readonly SCAN_FREQUENCY = 60000;   // Every minute

  private guild: Guild;
  private scanInterval: ReturnType<typeof setInterval>;

  constructor(guild: Guild) {
    this.guild = guild;
  }

  /**
   * Starts activity scanning
   */
  public start(): void {
    this.scanAllGuildMembers();
    this.scanInterval = setInterval(() => this.scanAllGuildMembers(), ActivityScanner.SCAN_FREQUENCY);
  }

  /**
   * Scans every guild member's activities
   */
  public scanAllGuildMembers(): void {
    this.guild.members.fetch().then((members: Collection<string, GuildMember>) => {
      members.forEach((member: GuildMember) => {
        this.scanGuildMember(member);   
      })
    });
  }

  /**
   * Scan a single guild member's activities
   * 
   * @param member Guild member to scan
   * @returns Nothing
   */
  public async scanGuildMember(member: GuildMember): Promise<void> {
    if (member.presence && member.presence.activities && member.presence.activities.length > 0) {
      await member.presence.activities.forEach((activity: Activity) => this.manageMemberActivity(member, activity));
    }
  }

  /**
   * Manages a guild member's activity
   * 
   * @param member Member for which activity should be managed
   * @param activity Activity to manage
   * @returns Nothing
   */
  private async manageMemberActivity(member: GuildMember, activity: Activity): Promise<void> {
    if (!activity.applicationId) return Promise.resolve();

    const game: IGame = await Game.findOne({ applicationId: activity.applicationId });
    if (!game) {
      // Game doesn't exist, create it in database
      await new Game({
        applicationId: activity.applicationId,
        gameName: activity.name,
        enabled: []
      }).save();

      this.createLogMessage(activity);
    } else {
      this.assignGame(member, game);
    }
  }

  /**
   * Sets a role to a guildMember if the given game has an associated role
   * 
   * @param member Member who'll get the role
   * @param game Game for which role should be given
   * @returns A Promise
   */
  private async assignGame(member: GuildMember, game: IGame): Promise<void> {
    const guildGame: IGuildGame = game.guildGames.find(guildGame => guildGame.guildId === member.guild.id);
    if (!guildGame || !guildGame.roleId || guildGame.archived) {
      return Promise.resolve();
    }

    const role = await this.guild.roles.fetch(guildGame.roleId);
    if (!role) {
      Logger.warn(`Error: role ${guildGame.roleId} does not exist in guild ${this.guild.name}`);
      return Promise.resolve();
    }

    member.roles.add(role);   // Add role to member
    Logger.info(`Giving role ${role.name} to ${member.displayName}`);
    return Promise.resolve();
  }
  
  /**
   * Creates a log message when a game is created with a ban button
   * 
   * @param activity Activity for which a game has been created
   * @returns Nothing
   */
  private async createLogMessage(activity: Activity): Promise<void> {
    if (!process.env.LOG_CHANNEL_ID) return ;
    
    const channel = await Bot.getClient().channels.fetch(process.env.LOG_CHANNEL_ID);

    if (!channel || !channel.isText()) return ;
    
    const messageEmbed = new MessageEmbed()
      .setColor('#0000FF')
      .setDescription(`Created game ${activity.name} with ID ${activity.applicationId}`)
      .setTitle('Log');

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setLabel('Ban')
        .setCustomId(`games-roles-ban-game-${activity.applicationId}`)
        .setStyle('DANGER')
    )

    channel.send({ embeds: [messageEmbed], components: [row] });
  }

  /**
   * Stop activity scanning
   */
  public stop(): void {
    clearInterval(this.scanInterval);
  }
}