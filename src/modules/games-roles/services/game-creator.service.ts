import { ButtonInteraction, CategoryChannel, Guild, MessageActionRow, MessageEmbed, Modal, ModalActionRowComponent, ModalSubmitInteraction, Role, TextInputComponent } from "discord.js";
import { Game } from "../models/game.model";
import { GamesRolesService } from "./games-roles.service";

export class GameCreator extends GamesRolesService {

  constructor(guild: Guild,gameCategory: CategoryChannel) {
    super(guild, gameCategory);
  }

  /**
   * Sends modal for game creation
   * 
   * @param interaction Button interaction pressed to send the modal
   */
   public async sendCreateGameModal(interaction: ButtonInteraction): Promise<void> {
    
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
   * Creates a new game which hasn't been detected by the bot
   * @param interaction contains game's name to create
   * @returns Nothing
   */
  public async createGame(interaction: ModalSubmitInteraction): Promise<void> {
    await interaction.deferUpdate();

    // Message content
    const gameName: string = interaction.fields.getTextInputValue('game-name');

    // Create game
    const game = new Game({ 
      applicationId: 'custom-' + Date.now(),
      gameName: gameName,
      guildGames: [],
      banned: false
    });

    // Create role
    const role: Role = await this.createRole(game);

    // Create channel
    const channel = await this.createChannel(game, role.id);

    game.guildGames.push({ 
      guildId: this.guild.id,
      roleId: role.id,
      roleName: role.name,
      roleColor: null,
      channelId: (channel) ? channel.id : null,
      archived: false
    });
    await game.save();

    // Confirmation message
    const embed = new MessageEmbed()
      .setAuthor({
        name: interaction.guild.me.displayName,
        iconURL: interaction.guild.me.displayAvatarURL()
      })
      .setColor('GREEN')
      .setDescription(`Game **${game.gameName}** created!`)
      .setFields(
        { name: 'Role', value: `<@&${role.id}>`},
        { name: 'Channel', value: `<#${channel.id}>`}
      );
  
    await interaction.editReply({ content: null, embeds: [embed], components: [] });

    return ;
  }
}