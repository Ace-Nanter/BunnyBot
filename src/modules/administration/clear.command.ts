import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, TextChannel } from 'discord.js';
import { Logger } from '../../logger/logger';
import { Command } from '../../models/modules/command.model';

export default class ClearCommand extends Command {
  name = 'clear';
  description = 'Clear messages';

  slashCommand = new SlashCommandBuilder().setName('clear')
  .setDescription('Clear messages')
  .addIntegerOption(option => 
    option
    .setName('count')
    .setDescription('Number of messages which should be deleted')
    .setRequired(true)
  )
  .setDefaultPermission(false);

  execution = async (interaction: CommandInteraction): Promise<void> => {
    const count = interaction.options.getInteger('count');
    
    if(count < 1 || count > 99) {
      interaction.reply({ content: 'You need to input a number between 1 and 99.' });
      setTimeout(() => { interaction.deleteReply(); }, 10000);
      return ;
    }

    await (interaction.channel as TextChannel).bulkDelete(count, true)
    .then(() => {
      interaction.reply({ content: `Successfully deleted \`${count}\` messages.` });
      setTimeout(() => { interaction.deleteReply(); }, 10000);
    })
    .catch(error => {
			Logger.error(error);
			interaction.reply({ content: 'There was an error trying to prune messages in this channel!' });
      setTimeout(() => { interaction.deleteReply(); }, 10000);
		});
  }
}
 