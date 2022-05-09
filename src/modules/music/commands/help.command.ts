import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { Command } from '../../../models/modules/command.model';

export default class StopCommand extends Command {
  name = 'help';
  visible = true;
  description = 'Display how to use music module';

  slashCommand = new SlashCommandSubcommandBuilder()
    .setName(this.name)
    .setDescription(this.description);
  
  execution = async (interaction: CommandInteraction): Promise<void> => {
    interaction.reply({ embeds: [this.sendHelpMessage(interaction)], ephemeral: true });
  };

  /**
   * Create an embed containing the help message
   * @param interaction Command interaction used to display help
   * @returns A MessageEmbed to send
   */
  public sendHelpMessage(interaction: CommandInteraction): MessageEmbed {
    const embed: MessageEmbed = new MessageEmbed()
      .setAuthor(interaction.guild.me.displayName, interaction.guild.me.displayAvatarURL())
      .setTitle('Music player - Help')
      .addField('Play a song or add a new song to the queue',
        'Play a song or add it to the queue by typing the command `music play` followed by an url or a search text.\nYou have to be in a voice channel.'
      )
      .addField('Stop music', 'Stop playing music and disconnect the bot from the server by typing the command `music stop` or by clicking the button ⏹')
      .addField('Fast-forward', 'Skip to the next song by clicking the button ⏭')
      .addField('Rewind', 'Go back to the previous song by clicking the button ⏮')
      .addField('Pause music', 'Pause the current song by clicking ⏸, and resume playing by clicking ▶');

    return embed;
  }
}
