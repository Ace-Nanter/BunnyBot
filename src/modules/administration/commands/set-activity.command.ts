import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
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
      .setChoices({ name: 'Playing', value: 0 }, { name: 'Streaming', value: 1 }, { name: 'Listening', value: 2 }, { name: 'Watching', value: 3 }, { name: 'Competing', value: 5 })
  )
  .addStringOption(option => 
    option.setName('url')
    .setDescription('URL if type is STREAMING or LISTENING')
    .setRequired(false)
  )
  .setDefaultMemberPermissions(0)
  .setDMPermission(true);

  execution = async (interaction: ChatInputCommandInteraction): Promise<void> => {
    const activityDescription = interaction.options.getString('activity');
    const activityOptions = {
      type: interaction.options.getInteger('type'),
      url: interaction.options.getString('url')
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
