import { ButtonInteraction, CategoryChannel, Guild, Message, MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu, MessageSelectOptionData, ModalSubmitInteraction, Permissions, Role, SelectMenuInteraction, Snowflake, TextChannel } from "discord.js";
import { Logger } from "../../../logger/logger";
import { Game, IGame } from "../models/game.model";
import { GamesRolesService } from "./games-roles.service";

export class GameActivator extends GamesRolesService {

  constructor(guild: Guild, gameCategory: CategoryChannel) {
    super(guild, gameCategory);
  }

  /**
   * Sends select menu to choose a game to activate
   * 
   * @param interaction Button interaction which should be replied
   */
   public async sendActivateSelectMenu(interaction: ButtonInteraction): Promise<void> {

    await interaction.deferUpdate();
    this.sendActivateSelectMenuWithPagination(interaction, 25, 1);
  }

  /**
   * Prepares game list with pagination if necessary
   * 
   * @param games Game list to paginate
   * @param pageSize Page size
   * @param pageNumber Number of the page
   * @returns A list of message action row to put in the edited message
   */
  private async sendActivateSelectMenuWithPagination(interaction: ButtonInteraction, pageSize: number, pageNumber: number): Promise<void> {

    const messageActionRowArray: MessageActionRow[] = [];

    const message = interaction.message as Message;

    // Prepare options
    let games = await Game.getGamesThatCanBeActivatedForGuild(interaction.guildId)
    games = games.sort((a: IGame, b: IGame) => a.gameName.localeCompare(b.gameName));
    const gamesOptions = (games.length > 25) ? games.slice((pageNumber - 1) * pageSize, pageNumber * pageSize) : games;
    const options: MessageSelectOptionData[] = gamesOptions.map((game: IGame) => { return { label: game.gameName, value: game.applicationId }; });

    // Prepare select menu
    messageActionRowArray.push(this.prepareSelectMenuActionRow('games-roles-activate', 'Choose a game', options));
    
    // Set buttons
    if (games.length > 25) {
      messageActionRowArray.push(this.preparePaginationButtonsForActivationMenu(games.length, pageNumber, pageSize));

      const filter = i  => {
        return i.message.id === message.id && i.customId.startsWith('activate') && i.componentType === 'BUTTON';
      };
      
      message.awaitMessageComponent({ filter, componentType: 'BUTTON', time: 60000 })
        .then(async (interaction: ButtonInteraction) => {
          await interaction.deferUpdate();
          let newPageNumber = pageNumber;

          if (interaction.customId.includes('previous')) {
            newPageNumber--;
          } else if(interaction.customId.includes('next')) {
            newPageNumber++;
          }

          await this.sendActivateSelectMenuWithPagination(interaction, pageSize, newPageNumber);
        });
    }

    await interaction.editReply({ content: 'Choose a game to activate', embeds: [], components: messageActionRowArray });
  }

  /**
   * Sends select menu to choose a game to deactivate
   * 
   * @param interaction Button interaction which should be replied
   */
  public async sendDeactivateSelectMenu(interaction: ButtonInteraction): Promise<void> {

    await interaction.deferUpdate();

    const messageActionRow = new MessageActionRow();
    const selectMenu = new MessageSelectMenu();
    selectMenu.setCustomId('games-roles-deactivate');
    selectMenu.setPlaceholder('Choose a game');

    const games = await Game.getGamesThatCanBeDeactivatedForGuild(interaction.guildId);
    const options: MessageSelectOptionData[] = games.map((game: IGame) => { return { label: game.gameName, value: game.applicationId }; });

    selectMenu.setOptions(options);
    messageActionRow.addComponents(selectMenu);
    
    await interaction.editReply({ content: 'Choose a game to deactivate', embeds: [], components: [ messageActionRow ] });
  }

  /**
   * Activates a game
   * 
   * @param interaction Select Menu interaction containing information to activate game
   * @returns Nothing
   */
  public async activateGame(interaction: SelectMenuInteraction): Promise<void> {
    await interaction.deferUpdate();

    if (!interaction.values) return ;

    const applicationId: string = interaction.values[0];
    const game = await Game.findOne({ applicationId: applicationId });
    if (!game) {
      Logger.error(`Error: unable to find game to activate with applicationId ${applicationId}`);
      interaction.editReply('An error has occurred');
      return ;
    }

    // Create role
    const role: Role = await this.createRole(game);

    // Create channel - TODO : make this optional
    const channel = await this.createChannel(game, role.id);

    game.guildGames.push({ 
      guildId: this.guild.id,
      roleId: role.id,
      roleName: role.name,
      roleColor: null,
      channelId: (channel) ? channel.id : null,
      archived: false
    });
    game.save();

    // Confirmation message
    const embed = new MessageEmbed()
      .setAuthor({
        name: interaction.guild.me.displayName,
        iconURL: interaction.guild.me.displayAvatarURL()
      })
      .setColor('GREEN')
      .setDescription(`Game **${game.gameName}** activated!`)
      .setFields(
        { name: 'Role', value: `<@&${role.id}>`},
        { name: 'Channel', value: `<#${channel.id}>`}
      );
    
    await interaction.editReply({ content: null, embeds: [embed], components: [] });
  }

  /**
   * Activates a game
   * 
   * @param interaction Select Menu interaction containing information to activate game
   * @returns Nothing
   */
   public async deactivateGame(interaction: SelectMenuInteraction): Promise<void> {
    await interaction.deferUpdate();

    if (!interaction.values) return ;

    const applicationId: string = interaction.values[0];
    const game = await Game.findOne({ applicationId: applicationId });
    if (!game) {
      Logger.error(`Error: unable to find game to activate with applicationId ${applicationId}`);
      interaction.editReply('An error has occurred');
      return ;
    }

    const guildGame = game.guildGames.find(g => g.guildId === interaction.guildId);
    if (!guildGame) {
      Logger.error(`Error: this game ${applicationId} was not activated in this guild ${interaction.guildId}!`);
      interaction.editReply('An error has occurred');
      return ;
    }

    // Delete role
    if (guildGame.roleId) {
      const role: Role = await interaction.guild.roles.fetch(guildGame.roleId);
      if (role) role.delete();
    }
    

    // Delete channel
    if (guildGame.channelId) {
      const channel = await interaction.guild.channels.fetch(guildGame.channelId);
      if (channel) channel.delete();
    }

    // Delete guildGame in game (or game itself if custom)
    game.guildGames = game.guildGames.filter(guildGame => guildGame.guildId !== interaction.guildId);
    if (game.guildGames.length === 0 && game.applicationId.startsWith('custom')) {
      game.delete();
    } else {
      game.save();
    }

    // Confirmation message
    const embed = new MessageEmbed()
      .setAuthor({
        name: interaction.guild.me.displayName,
        iconURL: interaction.guild.me.displayAvatarURL()
      })
      .setColor('RED')
      .setDescription(`Game **${game.gameName}** deactivated!`)
    
    await interaction.editReply({ content: null, embeds: [embed], components: [] });
  }

  /**
   * Prepare a select menu action row
   * 
   * @param customId Custom Id to give to the menu
   * @param placeholder Place holder to give to the menu
   * @param options Options to set in the menu
   * 
   * @returns MessageActionRow containing the select menu with options
   */
  private prepareSelectMenuActionRow(customId: string, placeholder: string, options: MessageSelectOptionData[]): MessageActionRow {
    
    const selectMenu = new MessageSelectMenu();
    selectMenu.setCustomId(customId);
    selectMenu.setPlaceholder(placeholder);
    selectMenu.setOptions(options);
    
    const selectMenuRow = new MessageActionRow();
    selectMenuRow.addComponents(selectMenu);

    return selectMenuRow;
  }

  /**
   * Prepare pagination buttons for activation select menu
   * 
   * @param gameCount Total number of games
   * @param pageNumber Page number
   * @param pageSize Page size
   * 
   * @returns MessageActionRow containing pagination buttons
   */
  private preparePaginationButtonsForActivationMenu(gameCount: number, pageNumber: number, pageSize: number): MessageActionRow {
    const buttons = new MessageActionRow();
      
    if (pageNumber > 1) {
      const previousButton = new MessageButton();
      previousButton.setCustomId('activate-previous');
      previousButton.setLabel('');
      previousButton.setStyle('SECONDARY');
      previousButton.setEmoji('◀');

      buttons.addComponents(previousButton);
    }

    if ((pageNumber * pageSize) < gameCount) {
      const nextButton = new MessageButton();
      nextButton.setCustomId('activate-next');
      nextButton.setLabel('');
      nextButton.setStyle('SECONDARY');
      nextButton.setEmoji('▶');

      buttons.addComponents(nextButton);
    }

    return buttons;
  }
}