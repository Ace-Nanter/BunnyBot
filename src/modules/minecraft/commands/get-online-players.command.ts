import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Logger } from '../../../logger/logger';
import MinecraftBaseCommand from './minecraft-base-command.model';

export default class GetOnlinePlayersCommand extends MinecraftBaseCommand {
  name = 'players';
  description = 'Tells which players are online';

  slashCommand = new SlashCommandSubcommandBuilder()
    .setName(this.name)
    .setDescription(this.description);

  execution = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply();

    Logger.info(`${interaction.user.username} used command 'minecraft players'`);

    try {
      const response = await this.minecraftModule.client.getOnlinePlayers();
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