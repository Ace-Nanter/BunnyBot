import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Command } from '../../../models/command.model';

export default class GetOnlinePlayersCommand extends Command {
  name = 'online-players';
  description = 'Tells which players are online';

  slashCommand = new SlashCommandBuilder().setName(this.name)
  .setDescription(this.description)
  .setDefaultPermission(false);

  execution = async (interaction: CommandInteraction): Promise<void> => {
    
    interaction.reply({ content: `No one is here.` });
  }
}