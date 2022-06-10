import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Command } from '../../../models/command.model';
import { MessageHelper } from '../helpers/message.helper';

export default class GamesRolesCommand extends Command {
  name = 'games-roles';
  visible = true;
  description = 'Select your games roles';

  slashCommand = new SlashCommandSubcommandBuilder()
    .setName(this.name)
    .setDescription(this.description)
  
  execution = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply({ ephemeral: true });
    MessageHelper.sendGameSelectionMenu(interaction);
  };
}
