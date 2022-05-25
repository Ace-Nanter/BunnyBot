import { ButtonInteraction, CommandInteraction, GuildMember, Interaction, MessageActionRow, MessageButton, MessageSelectMenu, MessageSelectOptionData, Modal, ModalActionRowComponent, ModalSubmitInteraction, TextInputComponent } from "discord.js";
import { Logger } from "../../../logger/logger";
import { Game, IGame } from "../models/game.model";

export class MessageHelper {

  /**
   * Sends modal for game creation
   * 
   * @param interaction Button interaction pressed to send the modal
   */
  public static async sendCreateGameModal(interaction: ButtonInteraction): Promise<void> {
    
    // Create the modal
    const modal = new Modal()
      .setCustomId('games-roles-create-game')
      .setTitle('Add a new game in my list');

    // Add components to modal
    const gameInput = new TextInputComponent()
      .setCustomId('game-name')
      .setLabel("What's the game name?")
      .setStyle('SHORT');

    modal.addComponents(
      new MessageActionRow<ModalActionRowComponent>().addComponents(gameInput)
    );
  
    // Show the modal to the user
    await interaction.showModal(modal);
  }

  /**
   * Sends select menu to choose a game to activate
   * 
   * @param interaction Button interaction which should be replied
   */
  public static async sendActivateSelectMenu(interaction: ButtonInteraction): Promise<void> {

    await interaction.deferUpdate();

    const messageActionRow = new MessageActionRow();
    const selectMenu = new MessageSelectMenu();
    selectMenu.setCustomId('games-roles-activate');
    selectMenu.setPlaceholder('Choose a game');

    const games = await Game.getGamesThatCanBeActivatedForGuild(interaction.guildId);
    const options: MessageSelectOptionData[] = games.map((game: IGame) => { return { label: game.gameName, value: game.applicationId }; });

    selectMenu.setOptions(options);
    messageActionRow.addComponents(selectMenu);
    
    await interaction.editReply({ content: 'Choose a game to activate', embeds: [], components: [ messageActionRow ] });
  }

  /**
   * Sends select menu to choose a game to deactivate
   * 
   * @param interaction Button interaction which should be replied
   */
   public static async sendDeactivateSelectMenu(interaction: ButtonInteraction): Promise<void> {

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
   * Sends select menu to choose a game to archive
   * 
   * @param interaction  Button interaction which should be replied
   */
  public static async sendArchiveSelectMenu(interaction: ButtonInteraction): Promise<void> {

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
  public static async sendUnArchiveSelectMenu(interaction: ButtonInteraction): Promise<void> {

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

  public static async sendSendMessageModal(interaction: ButtonInteraction): Promise<void> {

    // Create the modal
		const modal = new Modal()
      .setCustomId('games-roles-send-message')
      .setTitle('Send a button for people to choose roles');
    
    // Add components to modal
    const messageInput = new TextInputComponent()
      .setCustomId('message-content')
      .setLabel("What should be the message content?")
      .setStyle('PARAGRAPH');
  
    const buttonInput = new TextInputComponent()
      .setCustomId('button-content')
      .setLabel("What should be the button content?")
      .setStyle('SHORT');

    modal.addComponents(
      new MessageActionRow<ModalActionRowComponent>().addComponents(messageInput),
      new MessageActionRow<ModalActionRowComponent>().addComponents(buttonInput)
    );
    
    // Show the modal to the user
    await interaction.showModal(modal);
  }

  /**
   * Sends a message in interaction's channel to let members choose their roles
   * 
   * @param interaction MOdal submit interaction containing what should be in message
   */
  public static async sendJoinMessage(interaction: ModalSubmitInteraction): Promise<void> {

    const messageActionRow = new MessageActionRow();

    // Message content
    const messageContent: string = interaction.fields.getTextInputValue('message-content');
    const buttonContent: string = interaction.fields.getTextInputValue('button-content');

    // Join button
    const button = new MessageButton()
      .setCustomId('games-roles-join')
      .setEmoji('🎮')
      .setLabel(buttonContent ? buttonContent : 'Join a game')
      .setStyle("SUCCESS");

    messageActionRow.addComponents(button);
    await interaction.channel.send({ content: messageContent, components: [messageActionRow] });
    await interaction.deferReply();
    await interaction.deleteReply();
  }

  /**
   * Sends select menu containing games with roles to select
   * 
   * @param interaction Interaction to answer
   */
   public static async sendGameSelectionMenu(interaction: Interaction): Promise<void> {

    if (interaction.isButton()) {
      await interaction.deferReply({ ephemeral: true });
    }

    const messageActionRow = new MessageActionRow();
    const selectMenu = new MessageSelectMenu();
    selectMenu.setCustomId('games-roles-join-selected');
    selectMenu.setPlaceholder('Choose a game')
    
    const games = await Game.getGamesWithRolesForGuild(interaction.guildId);
    const options: MessageSelectOptionData[] = await Promise.all(games.map(async (game: IGame) => {
      try {
        const selected: boolean = await MessageHelper.getGameRoleForUser(game, interaction.member as GuildMember);
        return { label: game.gameName, value: game.applicationId, default: selected };
      } catch (error) {
        Logger.warn(error);
      }
    }));

    selectMenu.setOptions(options);
    selectMenu.setMinValues(0);
    selectMenu.setMaxValues(options.length);
    messageActionRow.addComponents(selectMenu);
    
    
    await (interaction as ButtonInteraction | CommandInteraction)
      .editReply({ content: 'Choose the game role you want to join', embeds: [], components: [ messageActionRow ] });
  }

  /**
   * Tells if a guild member has a role for the given game
   * 
   * @param game Given game for which role should be tested
   * @param member Guild member to test
   * @returns True if the member has the role, otherwise false
   */
  private static async getGameRoleForUser(game: IGame, member: GuildMember): Promise<boolean> {

    const guildGame = game.guildGames.find(g => g.guildId === member.guild.id);

    if (!guildGame || !guildGame.roleId) {
      throw `An error occurred for game with applicationId ${game.applicationId} in guild ${member.guild.id}`;
    }

    return member.roles.cache.has(guildGame.roleId);
  }
}