import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Logger } from '../../../logger/logger';
import GameServersBaseCommand from './game-servers-base-command.model';

export default class GetOnlinePlayersCommand extends GameServersBaseCommand {
  name = 'players';
  description = 'Tells which players are online';

  slashCommand = new SlashCommandSubcommandBuilder()
    .setName(this.name)
    .setDescription(this.description);

  execution = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply();

    Logger.info(`${interaction.user.username} used command '${this.game} players'`);

    try {
      const response = await this.gameServersModule.client.getOnlinePlayers(this.game);
      if (response.length > 0) {
        await interaction.editReply({ content: `Connected players: ${response.join(', ')}`});
      } else {
        await interaction.editReply({ content: `No one is connected!`});
      }
      
    } catch (error) {
      await interaction.editReply({ content: error });
    }
  }
}