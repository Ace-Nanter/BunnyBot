import { Message } from 'discord.js';
import { BotModule } from '../../models/bot-module.model';
import { MessageStatsUtils } from './utils/message-stats.utils';

export class StatsModule extends BotModule {

  protected initCallbacks(): void {
    this.callbacks.set('messageCreate', async (message: Message) => {
      this.manageMessageStats(message);
    }); 
    // this.callbacks.set('interactionCreate', async (interaction: Interaction) => {
    //   if (interaction.guildId === this.guildId) this.onInteraction(interaction);
    // });
    // this.callbacks.set('guildMemberAdd', async (guildMember: GuildMember) => {
    //   if (guildMember.guild.id === this.guildId) this.onNewGuildMember(guildMember);
    // });
  }

  protected initCommands(): void { return ; }

  protected async initModule(): Promise<void> { return ; }

  private async manageMessageStats(message: Message): Promise<void> {
    await MessageStatsUtils.manageMessage(message);
  }
}