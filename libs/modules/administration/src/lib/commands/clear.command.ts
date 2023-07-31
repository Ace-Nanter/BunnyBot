import { Logger } from '@BunnyBot/logger';
import { Command } from '@BunnyBot/modules/base';
import { CommandInteraction, SlashCommandBuilder, TextChannel } from 'discord.js';

export default class ClearCommand implements Command {
  name = 'clear';
  description = 'Clear messages';

  slashCommand = new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clear messages')
    .addIntegerOption((option) =>
      option.setName('count').setDescription('Number of messages which should be deleted').setRequired(true)
    )
    .setDefaultMemberPermissions('0')
    .setDMPermission(true);

  async execution(interaction: CommandInteraction) {
    const count = interaction.options.get('count').value as number;
    if (count < 1 || count > 99) {
      return interaction.reply({ content: 'You need to input a number between 1 and 99.' }).then(() => {
        setTimeout(() => {
          interaction.deleteReply();
        }, 5000);
      });
    }

    return (interaction.channel as TextChannel)
      .bulkDelete(count, true)
      .then(() => {
        interaction.reply({ content: `Successfully deleted \`${count}\` messages.` }).then(() => {
          setTimeout(() => {
            interaction.deleteReply();
          }, 5000);
        });
      })
      .catch((error) => {
        Logger.error(error);
        interaction.reply({ content: 'There was an error trying to prune messages in this channel!' }).then(() => {
          setTimeout(() => {
            interaction.deleteReply();
          }, 5000);
        });
      });
  }
}
