import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, GuildMember, Interaction, MessageFlags, ModalSubmitInteraction, StringSelectMenuBuilder, GuildTextBasedChannel, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import type { APISelectMenuOption } from "discord-api-types/v10";
import { Logger } from "../../../logger/logger";
import { Game, IGame } from "../models/game.model";

export class MessageHelper {

  public static async sendSendMessageModal(interaction: ButtonInteraction): Promise<void> {

    // Create the modal
		const modal = new ModalBuilder()
      .setCustomId('games-roles-send-message')
      .setTitle('Send a button for people to choose roles');
    
    // Add components to modal
    const messageInput = new TextInputBuilder()
      .setCustomId('message-content')
      .setLabel("What should be the message content?")
      .setStyle(TextInputStyle.Paragraph);
  
    const buttonInput = new TextInputBuilder()
      .setCustomId('button-content')
      .setLabel("What should be the button content?")
      .setStyle(TextInputStyle.Short);

    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(messageInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(buttonInput)
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

    const messageActionRow = new ActionRowBuilder<ButtonBuilder>();

    // Message content
    const messageContent: string = interaction.fields.getTextInputValue('message-content');
    const buttonContent: string = interaction.fields.getTextInputValue('button-content');

    // Join button
    const button = new ButtonBuilder()
      .setCustomId('games-roles-join')
      .setEmoji('🎮')
      .setLabel(buttonContent ? buttonContent : 'Join a game')
      .setStyle(ButtonStyle.Success);

    messageActionRow.addComponents(button);
    await (interaction.channel as GuildTextBasedChannel).send({ content: messageContent, components: [messageActionRow] });
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
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    }

    const messageActionRow = new ActionRowBuilder<StringSelectMenuBuilder>();
    const selectMenu = new StringSelectMenuBuilder();
    selectMenu.setCustomId('games-roles-join-selected');
    selectMenu.setPlaceholder('Choose a game')
    
    const games = await Game.getGamesWithRolesForGuild(interaction.guildId);
    // Cast preserved from v13 behavior: the map may yield `undefined` when a
    // game without a role throws at runtime ; original code did the same.
    const options: APISelectMenuOption[] = (await Promise.all(games.map(async (game: IGame) => {
      try {
        const selected: boolean = await MessageHelper.getGameRoleForUser(game, interaction.member as GuildMember);
        return { label: game.gameName, value: game.applicationId, default: selected };
      } catch (error) {
        Logger.warn(error);
      }
    }))) as APISelectMenuOption[];

    selectMenu.setOptions(options);
    selectMenu.setMinValues(0);
    selectMenu.setMaxValues(options.length);
    messageActionRow.addComponents(selectMenu);
    
    
    await (interaction as ButtonInteraction | ChatInputCommandInteraction)
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
