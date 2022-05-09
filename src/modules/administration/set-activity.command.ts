import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Bot } from '../../bot';
import { Dao } from '../../dao/dao';
import { Command } from '../../models/modules/command.model';

export default class SetActivityCommand extends Command {
  name = 'set-activity';
  description = 'Define bot status';
  
  slashCommand = new SlashCommandBuilder().setName(this.name)
  .setDescription(this.description)
  .addStringOption(option => 
    option.setName('activity')
    .setDescription('Activity which should be set')
    .setRequired(true)
  )
  .addIntegerOption(option => 
    option.setName('type')
      .setDescription('Type of activity')
      .setRequired(true)
      .addChoices([['Playing', 0], ['Streaming', 1], ['Listening', 2], ['Watching', 3], ['Competing', 5]])
  )
  .addStringOption(option => 
    option.setName('url')
    .setDescription('URL if type is STREAMING or LISTENING')
    .setRequired(false)
  )
  .setDefaultPermission(false);

  execution = async (interaction: CommandInteraction): Promise<void> => {
    const activity = interaction.options.getString('activity');
    const activityOptions = {
      type: interaction.options.getInteger('type'),
      url: interaction.options.getString('url')
    };
    
    Bot.getClient().user.setActivity(activity, activityOptions);
    Dao.getInstance().saveActivity(activity, activityOptions);
    interaction.reply({ content: 'Activity set!' });
    setTimeout(() => { interaction.deleteReply(); }, 10000);
  }
}
