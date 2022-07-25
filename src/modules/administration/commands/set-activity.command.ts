import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Bot } from '../../../bot';
import { Logger } from '../../../logger/logger';
import { Command } from '../../../models/command.model';
import { Activity } from '../models/activity.model';

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
      .addChoices(
        { name: 'Playing', value: 0 },
        { name: 'Streaming', value: 1 },
        { name: 'Listening', value: 2 },
        { name: 'Watching', value: 3 },
        { name: 'Competing', value: 5 }
      )
  )
  .addStringOption(option => 
    option.setName('url')
    .setDescription('URL if type is STREAMING or LISTENING')
    .setRequired(false)
  )
  .setDefaultPermission(false);

  execution = async (interaction: CommandInteraction): Promise<void> => {
    const activityDescription = (interaction.options.get('activity').value) as string;
    const activityOptions = {
      type: (interaction.options.get('type').value) as number,
      url: (interaction.options.get('url').value) as string
    };
    
    Bot.getClient().user.setActivity(activityDescription, activityOptions);

    try {
      await Activity.findOneAndUpdate({}, { activity: activityDescription, options: activityOptions }, { upsert: true });
    } catch (error) {
      Logger.error(error);
    }

    interaction.reply({ content: 'Activity set!' });
    setTimeout(() => { interaction.deleteReply(); }, 10000);
  }
}
