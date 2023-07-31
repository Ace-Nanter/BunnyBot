import { getVoiceConnection } from '@discordjs/voice';
import { CommandInteraction, SlashCommandSubcommandBuilder } from 'discord.js';
import AbstractMusicCommand from './abstract-music.command';

export default class StopCommand extends AbstractMusicCommand {
  name = 'stop';
  visible = true;
  description = 'Stops music and disconnect bot';

  slashCommand = new SlashCommandSubcommandBuilder().setName(this.name).setDescription(this.description);

  async execution(interaction: CommandInteraction): Promise<void> {
    if (!interaction.guildId) {
    }

    const connection = getVoiceConnection(interaction.guild?.id);
    const serverQueue = this.module.guildMusicMap.get(interaction.guild?.id);

    if (!serverQueue && !connection) {
      interaction.reply({
        content: 'There is no music here... Did you mean to use the command `/music play`?',
        ephemeral: true,
      });
      return;
    }

    if (serverQueue) {
      serverQueue.disconnect();
    }

    interaction.reply({ content: 'See you soon! 👋' });
    setTimeout(() => {
      interaction.deleteReply();
    }, 10000);
  }
}
