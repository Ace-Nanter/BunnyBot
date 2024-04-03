import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Logger } from '../../../logger/logger';
import GameServersBaseCommand from './game-servers-base-command.model';

export default class StopServerCommand extends GameServersBaseCommand {
  name = 'stop';
  description = 'Stops game server';

  slashCommand = new SlashCommandSubcommandBuilder()
    .setName(this.name)
    .setDescription(this.description)

  execution = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply();

    Logger.info(`${interaction.user.username} used command '${this.game} stop'`);

    try {
      await this.gameServersModule.client.stopServer(this.game);
      await interaction.editReply({ content: `🔴 Server is stopping...`});
    } catch (error) {
      await interaction.editReply({ content: error});
    }
  }
}
 