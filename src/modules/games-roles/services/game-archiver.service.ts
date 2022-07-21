
import { ButtonInteraction, CategoryChannel, Guild, MessageActionRow, MessageSelectMenu, MessageSelectOptionData, Role, SelectMenuInteraction } from "discord.js";
import { Logger } from "../../../logger/logger";
import { Game, IGame } from "../models/game.model";
import { IGuildGame } from "../models/guild-game.model";
import { GamesRolesService } from "./games-roles.service";

export class GameArchiver extends GamesRolesService {

  private archiveCategory: CategoryChannel;

  constructor(guild: Guild, gameCategory: CategoryChannel, archiveCategory: CategoryChannel) {
    super(guild, gameCategory);
    this.archiveCategory = archiveCategory;
  }

  /**
   * Sends select menu to choose a game to archive
   * 
   * @param interaction  Button interaction which should be replied
   */
   public async sendArchiveSelectMenu(interaction: ButtonInteraction): Promise<void> {

    await interaction.deferUpdate();

    const messageActionRow = new MessageActionRow();
    const selectMenu = new MessageSelectMenu();
    selectMenu.setCustomId('games-roles-archive');
    selectMenu.setPlaceholder('Choose a game to archive');

    const games = await Game.getGamesWithChannelsForGuild(interaction.guildId);
    const options: MessageSelectOptionData[] = games.map((game: IGame) => { return { label: game.gameName, value: game.applicationId }; });

    selectMenu.setOptions(options);
    messageActionRow.addComponents(selectMenu);
    
    await interaction.editReply({ content: 'Choose a game to archive', embeds: [], components: [ messageActionRow ] });
  }

  /**
   * Sends select menu to choose a game to unarchive
   * 
   * @param interaction Button interaction which should be replied
   */
  public async sendUnArchiveSelectMenu(interaction: ButtonInteraction): Promise<void> {

    await interaction.deferUpdate();

    const messageActionRow = new MessageActionRow();
    const selectMenu = new MessageSelectMenu();
    selectMenu.setCustomId('games-roles-unarchive');
    selectMenu.setPlaceholder('Choose a game to unarchive');

    const games = await Game.getArchivedGamesForGuild(interaction.guildId);
    const options: MessageSelectOptionData[] = games.map((game: IGame) => { return { label: game.gameName, value: game.applicationId }; });

    selectMenu.setOptions(options);
    messageActionRow.addComponents(selectMenu);
    
    await interaction.editReply({ content: 'Choose a game to unarchive', embeds: [], components: [ messageActionRow ] });
  }

  /**
   * Archives a game
   * 
   * @param interaction Interaction containing which game should be unarchived
   * @returns Nothing
   */
  public async archiveGame(interaction: SelectMenuInteraction): Promise<void> {
    await interaction.deferUpdate();

    if (!interaction.values) return ;

    if (!this.archiveCategory) {
      Logger.error(`Archive category not set, unable to archive!`);
      interaction.editReply('An error has occurred');
      return ;
    }
    
    const applicationId: string = interaction.values[0];
    const game = await Game.findOne({ applicationId: applicationId });
    const guildGame: IGuildGame = game.guildGames.find(g => g.guildId === interaction.guildId);

    if (!guildGame) {
      Logger.error(`Error: unable to find game to archive with applicationId ${applicationId} for guild ${interaction.guildId}`);
      interaction.editReply('An error has occurred');
      return ;
    }

    // Move channel
    const channel = await this.guild.channels.fetch(guildGame.channelId);
    channel.setParent(this.archiveCategory);

    // Backup role and delete it
    const role = await this.guild.roles.fetch(guildGame.roleId);
    guildGame.roleName = role.name;
    guildGame.roleColor = role.color;
    guildGame.archived = true;
    
    role.delete();
    game.save();

    // Confirmation message
    await interaction.editReply({ content: `Game ${game.gameName} archived!`, components: [] });
  }

  /**
   * Unarchives a game
   * 
   * @param interaction Interaction containing which game should be unarchived
   * @returns Nothing
   */
  public async unarchiveGame(interaction: SelectMenuInteraction): Promise<void> {
    await interaction.deferUpdate();

    if (!interaction.values) return ;

    if (!this.archiveCategory) {
      Logger.error(`Archive category not set, unable to archive!`);
      interaction.editReply('An error has occurred');
      return ;
    }
    
    const applicationId: string = interaction.values[0];
    const game = await Game.findOne({ applicationId: applicationId });
    const guildGame: IGuildGame = game.guildGames.find(g => g.guildId === interaction.guildId);

    if (!guildGame.archived) {
      Logger.error(`Error, trying to unarchive a non archived game!`);
      interaction.editReply('An error has occurred');
      return ;
    }

    // Create role
    const role: Role = await this.guild.roles.create({ name: guildGame.roleName, color: guildGame.roleColor });
    guildGame.roleId = role.id;

    // Move back channel
    const channel = await this.guild.channels.fetch(guildGame.channelId);
    channel.setParent(this.gameCategory);

    guildGame.archived = false;
    await game.save();

    await interaction.editReply({ content: `Game ${game.gameName} unarchived!`, components: [] });
  }
}