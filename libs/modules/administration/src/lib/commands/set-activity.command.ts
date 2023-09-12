import { Logger } from '@BunnyBot/logger';
import { Command, replyAndDelete } from '@BunnyBot/modules/base';
import { Client, CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Activity } from '../models/activity.model';

export default class SetActivityCommand implements Command {
  guildId?: string;
  client: Client;
  name = 'set-activity';
  description = 'Define bot status';

  slashCommand = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description)
    .addStringOption((option) =>
      option.setName('activity').setDescription('Activity which should be set').setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName('type')
        .setDescription('Type of activity')
        .setRequired(true)
        .setChoices(
          { name: 'Playing', value: 0 },
          { name: 'Streaming', value: 1 },
          { name: 'Listening', value: 2 },
          { name: 'Watching', value: 3 },
          { name: 'Competing', value: 5 }
        )
    )
    .addStringOption((option) =>
      option.setName('url').setDescription('URL if type is STREAMING or LISTENING').setRequired(false)
    )
    .setDMPermission(true)
    .setDefaultMemberPermissions('0');

  async execution(interaction: CommandInteraction): Promise<void> {
    const activityDescription = interaction.options.get('activity').value as string;
    const activityOptions = {
      type: interaction.options.get('type').value as number,
      url: (interaction.options.get('url', false)?.value as string) ?? undefined,
    };

    this.client.user.setActivity(activityDescription, activityOptions);
    Activity.findOneAndUpdate({}, { activity: activityDescription, options: activityOptions }, { upsert: true }).catch(
      (error) => Logger.error(error)
    );

    return replyAndDelete(interaction, 'Activity set!');
  }

  constructor(client: Client) {
    this.client = client;
  }
}
