import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Command } from '../../../models/command.model';

export default class StopServerCommand extends Command {
  name = 'stop-server';
  description = 'Stops Minecraft server';

  slashCommand = new SlashCommandBuilder().setName(this.name)
  .setDescription(this.description)
  .setDefaultPermission(false);

  execution = async (interaction: CommandInteraction): Promise<void> => {
    interaction.reply({ content: `Minecraft server stopped.` });
  }
}
 