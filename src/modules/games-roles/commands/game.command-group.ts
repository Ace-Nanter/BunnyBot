import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Command } from '../../../models/command.model';
import { GamesRolesModule } from '../games-roles.module';
import { default as ActivateGameCommand } from './enable-game.command';

export default class GamesRolesCommand extends Command {
  name = 'games-roles';
  visible = true;
  description = 'Every commands managing roles for games';

  private activateCommand = new ActivateGameCommand(this.gamesRolesModule);
  private archiveCommand = new ActivateGameCommand(this.gamesRolesModule);
  
  slashCommand = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description)
    .addSubcommand(this.activateCommand.slashCommand)
  
  execution = async (interaction: CommandInteraction): Promise<void> => {
    switch (interaction.options.getSubcommand()) {
      case 'activate':
        this.activateCommand.execution(interaction);
        break;
      case 'archive':
        this.archiveCommand.execution(interaction);
        break;
    }
  };

  private get gamesRolesModule(): GamesRolesModule {
    return this.module as GamesRolesModule;
  }
}
