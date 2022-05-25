import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CommandInteraction, GuildMember, MessageActionRow, MessageSelectMenu, MessageSelectOptionData } from 'discord.js';
import { Logger } from '../../../logger/logger';
import { Command } from '../../../models/command.model';
import { MessageHelper } from '../helpers/message.helper';
import { Game, IGame } from '../models/game.model';


export default class JoinGameCommand extends Command {
  name = 'join';
  visible = true;
  description = 'Join a game';

  slashCommand = new SlashCommandSubcommandBuilder()
    .setName(this.name)
    .setDescription(this.description)
  
  execution = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply({ ephemeral: true });
    MessageHelper.sendGameSelectionMenu(interaction);
  };

  
}
