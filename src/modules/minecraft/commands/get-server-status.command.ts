import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Command } from '../../../models/command.model';

export default class GetServerStatusCommand extends Command {
  name = 'get-server-status';
  description = 'Tells if Minecraft server is offline or online';

  slashCommand = new SlashCommandBuilder().setName(this.name)
  .setDescription(this.description)
  .setDefaultPermission(false);

  execution = async (interaction: CommandInteraction): Promise<void> => {
    
    interaction.reply({ content: `It's up!` });
  }
}