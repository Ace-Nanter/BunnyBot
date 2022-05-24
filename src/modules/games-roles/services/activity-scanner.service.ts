import { Activity, Collection, Guild, GuildMember } from 'discord.js';
import { Logger } from '../../../logger/logger';
import { Game, IGame } from '../game.model';

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
    this.scanActivities();
    this.scanInterval = setInterval(() => this.scanActivities(), ActivityScanner.SCAN_FREQUENCY);
  }

  public scanActivities(): void {
    this.guild.members.fetch().then((members: Collection<string, GuildMember>) => {
      members.forEach((member: GuildMember) => {
        if (member.presence && member.presence.activities && member.presence.activities.length > 0) {
          member.presence.activities.forEach((activity: Activity) => this.manageMemberActivity(member, activity));
        }
      })
    });
  }

  /**
   * Manages a guild member's activity
   * 
   * @param member Member for which activity should be managed
   * @param activity Activity to manage
   * @returns A Promise
   */
  private async manageMemberActivity(member: GuildMember, activity: Activity): Promise<void> {
    if (!activity.applicationId) return Promise.resolve();

    const game: IGame = await Game.findOne({ applicationId: activity.applicationId });
    if (!game) {
      // Game doesn't exist, create it in database
      await new Game({
        applicationId: activity.applicationId,
        gameName: activity.name,
        enabled: false
      }).save();

      return Promise.resolve();
    } else {
      return this.assignGame(member, game);
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
    if (!game.enabled || !game.role) {
      return Promise.resolve();
    }

    const role = await this.guild.roles.fetch(game.role.id);
    if (!role) {
      Logger.warn(`Error: role ${game.role.id} does not exist in guild ${this.guild.name}`);
      return Promise.resolve();
    }

    member.roles.add(role);   // Add role to member
    Logger.info(`Giving role ${role.name} to ${member.displayName}`);
    return Promise.resolve();
  }
  
  /**
   * Stop activity scanning
   */
  public stop(): void {
    clearInterval(this.scanInterval);
  }
}