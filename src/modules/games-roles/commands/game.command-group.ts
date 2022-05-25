import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Command } from '../../../models/command.model';
import { GamesRolesModule } from '../games-roles.module';
import { default as GamesRolesAdminCommand } from './games-roles-admin.command';
import { default as JoinGameCommand } from './join-game.command';

export default class GamesRolesCommand extends Command {
  name = 'games-roles';
  visible = true;
  description = 'Every commands managing roles for games';

  private joinCommand = new JoinGameCommand(this.gamesRolesModule);
  private adminCommand = new GamesRolesAdminCommand(this.gamesRolesModule);
  
  slashCommand = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description)
    .addSubcommand(this.joinCommand.slashCommand)
    .addSubcommand(this.adminCommand.slashCommand);
  
  execution = async (interaction: CommandInteraction): Promise<void> => {
    switch (interaction.options.getSubcommand()) {
      case 'join':
        this.joinCommand.execution(interaction);
        break;
      case 'admin':
        this.adminCommand.execution(interaction);
        break;
    }
  };

  private get gamesRolesModule(): GamesRolesModule {
    return this.module as GamesRolesModule;
  }
}
