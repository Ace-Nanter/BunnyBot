import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Command } from '../../../models/modules/command.model';
import { MusicModule } from '../music.module';
import { default as PlayCommandClass } from './play.command';
import { default as StopCommandClass } from './stop.command';
import { default as HelpCommandClass } from './help.command';

export default class MusicCommand extends Command {
  name = 'music';
  visible = true;
  description = 'Every music commands';

  private playCommand = new PlayCommandClass(this.musicModule);
  private stopCommand = new StopCommandClass(this.musicModule);
  private helpCommand = new HelpCommandClass(this.musicModule);
  
  slashCommand = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description)
    .addSubcommand(this.playCommand.slashCommand)
    .addSubcommand(this.stopCommand.slashCommand)
    .addSubcommand(this.helpCommand.slashCommand)
  
  execution = async (interaction: CommandInteraction): Promise<void> => {
    switch (interaction.options.getSubcommand()) {
      case 'play':
        this.playCommand.execution(interaction);
        break;
      case 'stop':
        this.stopCommand.execution(interaction);
        break;
      case 'help':
        this.helpCommand.execution(interaction);
        break;
    }
  };

  private get musicModule(): MusicModule {
    return this.module as MusicModule;
  }
}
