import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import AbstractMusicCommand from './abstract-music.command';
import PlayCommand from './play.command';

export default class MusicCommand extends AbstractMusicCommand {
  name = 'music';
  visible = true;
  description = 'Every music commands';

  private playCommand = new PlayCommand(this.module);
  private stopCommand = new StopCommand(this.musicModule);
  private helpCommand = new HelpCommand(this.musicModule);

  slashCommand = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description)
    .addSubcommand(this.playCommand.slashCommand)
    .addSubcommand(this.stopCommand.slashCommand)
    .addSubcommand(this.helpCommand.slashCommand);

  async execution(interaction: CommandInteraction): Promise<void> {
    switch (interaction.options.getSubcommand()) {
      case 'play':
        return this.playCommand.execution(interaction);
      case 'stop':
        return this.stopCommand.execution(interaction);
      case 'help':
        return this.helpCommand.execution(interaction);
      default:
        // TODO : error
        return Promise.resolve();
    }
  }
}
