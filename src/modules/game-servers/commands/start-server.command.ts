import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Logger } from '../../../logger/logger';
import GameServersBaseCommand from './game-servers-base-command.model';

export default class StartServerCommand extends GameServersBaseCommand {
  name = 'start';
  description = 'Starts game server';

  slashCommand = new SlashCommandSubcommandBuilder()
    .setName(this.name)
    .setDescription(this.description)

  execution = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply();

    Logger.info(`${interaction.user.username} used command '${this.game} start'`);

    try {
      await this.gameServersModule.client.startServer(this.game);
      await interaction.editReply({ content: `🟢 Server is starting...`});
    } catch (error) {
      await interaction.editReply({ content: error });
    }
  }
}
 