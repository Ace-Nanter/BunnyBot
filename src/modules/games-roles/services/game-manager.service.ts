import { CategoryChannel, Guild, MessageEmbed, ModalSubmitInteraction, Permissions, Role, SelectMenuInteraction, Snowflake, TextChannel } from "discord.js";
import { Logger } from "../../../logger/logger";
import { Game, IGame } from "../models/game.model";
import { IGuildGame } from "../models/guild-game.model";

export class GameManager {

  constructor(
    private readonly guild: Guild,
    private readonly gameCategory: CategoryChannel,
    private readonly archiveCategory: CategoryChannel
  ) { }

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

  /**
   * Creates a role for a given game
   * 
   * @param game Game for which role should be created
   * @returns Created role in a promise
   */
  private createRole(game: IGame): Promise<Role> {
    return this.guild.roles.create({ name: game.gameName });
  }

  /**
   * Creates a channel by default for a given game
   * @param game Game for which channel should be created
   * @param roleId Role created for this channel which should be the only one to have access to the channel
   * @returns Created text channel in a promise
   */
  private createChannel(game: IGame, roleId: Snowflake): Promise<TextChannel> {
    const channelName = game.gameName.replace(/[^a-zA-Z0-9 ]/g, "").toLowerCase().replace(/\s/g, '-');
    const everyoneRole = this.guild.roles.everyone;

    return this.guild.channels.create(channelName, {
      type: 'GUILD_TEXT',
      parent: this.gameCategory,
      permissionOverwrites: [
        { 
          id: everyoneRole.id,
          deny: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES]
        },
        {
          id: roleId,
          allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES]
        }
      ]
    });
  }
}