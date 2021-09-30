import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Bot } from '../../bot';
import { CommandPermission } from '../../models/modules/command-permission.enum';
import { Command } from '../../models/modules/command.model';

export const setActivityCommand = new Command (

  new SlashCommandBuilder().setName('set-activity')
  .setDescription('Define bot status')
  .addStringOption(option => 
    option
    .setName('activity')
    .setDescription('Activity which should be set')
    .setRequired(true)
  )
  .setDefaultPermission(false),
  [ CommandPermission.OWNER, CommandPermission.GUILD_OWNER ],
  (interaction: CommandInteraction) => {
    const activity = interaction.options.getString('activity');
    
    Bot.getClient().user.setActivity(activity);
    interaction.reply({ content: 'Activity set!' });

    setTimeout(() => { interaction.deleteReply(); }, 10000);
  }
)
  