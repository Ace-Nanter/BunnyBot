import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { getVoiceConnection } from '@discordjs/voice';
import { CommandInteraction } from 'discord.js';
import { Command } from '../../../models/modules/command.model';
import { MusicModule } from '../music.module';

export default class StopCommand extends Command {
  name = 'stop';
  visible = true;
  description = 'Stops music and disconnect bot';

  slashCommand = new SlashCommandSubcommandBuilder()
    .setName(this.name)
    .setDescription(this.description);
  
  execution = async (interaction: CommandInteraction): Promise<void> => {

    const connection = getVoiceConnection(interaction.guild.id);
    const serverQueue = this.musicModule.guildMusicMap.get(interaction.guild.id);

    if(!serverQueue && !connection) {
      interaction.reply({ content: 'There is no music here... Did you mean to use the command `/music play`?', ephemeral: true});
      return ;
    }

    if(serverQueue) {
      serverQueue.disconnect();  
    }
    
    interaction.reply({ content: 'See you soon! 👋' });
    setTimeout(() => { interaction.deleteReply(); }, 10000);
  };

  private get musicModule(): MusicModule {
    return this.module as MusicModule;
  }
}
