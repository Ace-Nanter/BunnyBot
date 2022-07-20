import { Message, Presence } from 'discord.js';
import { BotModule } from '../../models/bot-module.model';
import { GameStats } from './models/game-stats.model';
import { MessageStatsUtils } from './utils/message-stats.utils';
import { PresenceUtils } from './utils/presence.utils';

export class StatsModule extends BotModule {

  protected initCallbacks(): void {
    this.callbacks.set('messageCreate', async (message: Message) => {
      this.manageMessageStats(message);
    });

    this.callbacks.set('presenceUpdate', async (oldPresence: Presence | null, newPresence: Presence) => {
      this.managePresenceUpdate(oldPresence, newPresence);
    });
  }

  protected initCommands(): void { return ; }

  protected async initModule(): Promise<void> { return ; }

  private async manageMessageStats(message: Message): Promise<void> {
    await MessageStatsUtils.manageMessage(message);
  }

  /**
   * Manages when presence changed
   * 
   * @param oldPresence Old presence status for the guild member who had its presence updated
   * @param newPresence New presence status for the guild member who had its presence updated
   */
  private async managePresenceUpdate(oldPresence: Presence | null, newPresence: Presence) {
    this.manageActivityUpdate(oldPresence, newPresence);
    this.manageStatusUpdate(oldPresence, newPresence);
  }

  private async manageActivityUpdate(oldPresence: Presence | null, newPresence: Presence) {

    const oldApplicationId = PresenceUtils.getApplicationIdFromPresence(oldPresence);
    const newApplicationId = PresenceUtils.getApplicationIdFromPresence(newPresence);

    // If activity hasn't changed, skip
    if (oldApplicationId === newApplicationId) {
      return ;
    }

    // Update old game stat Id if found
    if (oldApplicationId) {
      const oldGameStat = await GameStats.findLastGameStat(oldPresence.member.guild.id, oldPresence.member.user.id, oldApplicationId);

      // Define endDate
      if (oldGameStat) {
        oldGameStat.endDate = new Date(new Date().toUTCString());
        oldGameStat.save();
      }
    }

    // Create new game stats
    if (newApplicationId) {
      const newGameStats = new GameStats({
        startDate: new Date(new Date().toUTCString()),
        endDate:  new Date(new Date().toUTCString()).setUTCSeconds(59),
        guildId: newPresence.member.guild.id,
        userId: newPresence.member.user.id,
        applicationId: newApplicationId
      });

      newGameStats.save();
    }
  }

  private async manageStatusUpdate(oldPresence: Presence | null, newPresence: Presence) {
    // TODO : do stuff
  }
}