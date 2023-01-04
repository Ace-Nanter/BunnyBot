import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Logger } from '../../../logger/logger';
import MinecraftBaseCommand from './minecraft-base-command.model';

export default class StartServerCommand extends MinecraftBaseCommand {
  name = 'start';
  description = 'Starts Minecraft server';

  slashCommand = new SlashCommandSubcommandBuilder()
    .setName(this.name)
    .setDescription(this.description)

  execution = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply();

    Logger.info(`${interaction.user.username} used command 'minecraft start'`);

    try {
      await this.minecraftModule.client.startServer();
      await interaction.editReply({ content: `🟢 Server is starting...`});
    } catch (error) {
      await interaction.editReply({ content: error });
    }
  }
}
 