import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Logger } from '../../../logger/logger';
import MinecraftBaseCommand from './minecraft-base-command.model';

export default class GetServerStatusCommand extends MinecraftBaseCommand {
  name = 'status';
  description = 'Tells if Minecraft server is offline or online';

  slashCommand = new SlashCommandSubcommandBuilder()
    .setName(this.name)
    .setDescription(this.description);

  execution = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply();

    Logger.info(`${interaction.user.username} used command 'minecraft status'`);

    const response = await this.minecraftModule.client.getServerStatus();

    switch(response) {
      case 'STARTED':
        await interaction.editReply({ content: `🟢 Server is up!`});
        break;
      case 'STOPPED':
        await interaction.editReply({ content: `🔴 Server is down!`});
        break;
      default:
        await interaction.editReply({ content: `Unable to get server status...`});
        break;
    }
  }
}