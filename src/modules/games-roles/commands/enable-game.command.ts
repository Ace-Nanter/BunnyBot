import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { CommandInteraction, GuildMember, MessageActionRow, MessageSelectMenu, MessageSelectOptionData } from 'discord.js';
import { Command } from '../../../models/command.model';
import { Game, IGame } from '../models/game.model';
import { GamesRolesModule } from '../games-roles.module';


export default class ActivateGameCommand extends Command {
  name = 'activate';
  visible = true;
  description = 'Activate a game by creating an associated role and eventually an associated channel';

  slashCommand = new SlashCommandSubcommandBuilder()
    .setName(this.name)
    .setDescription(this.description)
    .addBooleanOption((option) => 
      option
        .setName('channel-creation')
        .setDescription('Should a channel be created?')
        .setRequired(false)
    );
  
  execution = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply();

    interaction.member = interaction.member as GuildMember;
    const channelCreation: boolean = interaction.options.getBoolean('channel-creation');
    
    this.activateGame(interaction, channelCreation);
  };

  private async activateGame(interaction: CommandInteraction, channelCreation: boolean): Promise<void> {

    const messageActionRow = new MessageActionRow();
    const selectMenu = new MessageSelectMenu();
    selectMenu.setCustomId('games-list-menu')
    selectMenu.setPlaceholder('Choose a game');

    const games = await Game.getGamesThatCanBeActivatedForGuild(interaction.guildId);
    const options: MessageSelectOptionData[] = games.map((game: IGame) => { return { label: game.gameName, value: game.applicationId }; });

    selectMenu.setOptions(options);
    messageActionRow.addComponents(selectMenu);
    
    interaction.editReply({ content: 'Test', components: [messageActionRow]});
  }

  private get gamesRolesModule(): GamesRolesModule {
    return this.module as GamesRolesModule;
  }
}
