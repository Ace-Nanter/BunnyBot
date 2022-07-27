import { ButtonInteraction, CategoryChannel, Guild, GuildMember, Interaction, MessageFlags, ModalSubmitInteraction, SelectMenuInteraction, MessageEmbed } from 'discord.js';
import { Bot } from '../../bot';
import { Logger } from '../../logger/logger';
import { BotModule } from '../../models/bot-module.model';
import { default as AdminGamesRolesCommand } from './commands/admin-games-roles.command';
import { default as GamesRolesCommand } from './commands/games-roles.command';
import { MessageHelper } from './helpers/message.helper';
import { Game, IGame } from './models/game.model';
import { ActivityScanner } from './services/activity-scanner.service';
import { GameActivator } from './services/game-activator.service';
import { GameArchiver } from './services/game-archiver.service';
import { GameCreator } from './services/game-creator.service';

const GAME_CATEGORY_CHANNEL_ID = 'gameCategoryChannelId';
const ARCHIVE_CATEGORY_CHANNEL_ID = 'archiveCategoryChannelId';
const SCAN_FREQUENCY = 'scanFrequency'

export class GamesRolesModule extends BotModule {

  private activityScanner: ActivityScanner;
  private gameActivator: GameActivator;
  private gameCreator: GameCreator;
  private gameArchiver: GameArchiver;

  private guild: Guild;
  private frequency: number;
  private gameCategory: CategoryChannel;
  private archiveCategory: CategoryChannel;

  protected initCallbacks(): void {
    this.callbacks.set('interactionCreate', async (interaction: Interaction) => {
      if (interaction.guildId === this.guildId || interaction.channelId === process.env.LOG_CHANNEL_ID) this.onInteraction(interaction);
    });
    this.callbacks.set('guildMemberAdd', async (guildMember: GuildMember) => {
      if (guildMember.guild.id === this.guildId) this.onNewGuildMember(guildMember);
    });
  }

  protected initCommands(): void {
    this.commands.push(new GamesRolesCommand(this));
    this.commands.push(new AdminGamesRolesCommand(this));
  }

  protected async initModule(params: any[]): Promise<void> {
    try {
      this.guild = await Bot.getClient().guilds.fetch(this.guildId);

      await this.initParams(params);

      this.gameCreator = new GameCreator(this.guild, this.gameCategory);
      this.gameActivator = new GameActivator(this.guild, this.gameCategory);
      this.gameArchiver = new GameArchiver(this.guild, this.gameCategory, this.archiveCategory);

      this.activityScanner = new ActivityScanner(this.guild, this.frequency);
      this.activityScanner.start();
    } catch (error) {
      Logger.error(error);
    }    
  }

  public get archiveCategoryChannel(): CategoryChannel {
    return this.archiveCategory;
  }

  private async initParams(params: any[]): Promise<void> {
    if (params[GAME_CATEGORY_CHANNEL_ID]) {
      const gameCategory = await Bot.getClient().channels.fetch(params[GAME_CATEGORY_CHANNEL_ID])
      if (gameCategory && gameCategory instanceof CategoryChannel) {
        this.gameCategory = (gameCategory as CategoryChannel);
      }
    } else {
      Logger.error('Error: no parameter found referencing game category channel');
    }

    if (params[ARCHIVE_CATEGORY_CHANNEL_ID]) {
      const archiveCategory = await Bot.getClient().channels.fetch(params[ARCHIVE_CATEGORY_CHANNEL_ID])
      if (archiveCategory && archiveCategory instanceof CategoryChannel) {
        this.archiveCategory = (archiveCategory as CategoryChannel);
      }
    } else {
      Logger.warn('Error: no parameter found referencing archive category channel');
    }

    if (params[SCAN_FREQUENCY]) {
      const frequency = Number.parseInt(params[SCAN_FREQUENCY]);
      this.frequency = frequency? frequency : 60000     // Default value = 1min
    }
  }

  private onInteraction(interaction: Interaction): void {
    if (interaction.isButton()) {
      this.manageButtonInteraction(interaction as ButtonInteraction); 
    }
    
    if (interaction.isSelectMenu()) {
      this.manageSelectMenuInteractions(interaction as SelectMenuInteraction);
    }

    if (interaction.isModalSubmit()) {
      this.manageModalSubmitInteractions(interaction as ModalSubmitInteraction);
    }
  }

  /**
   * Manages buttons interactions 
   * 
   * @param interaction Button interaction received
   */
  private async manageButtonInteraction(interaction: ButtonInteraction): Promise<void> {
    if (!interaction.customId.startsWith('games-roles-')) {
      return ;
    }
    
    if (interaction.customId.includes('ban-game-')) {
      await this.banGame(interaction);
      return ;
    }

    switch(interaction.customId.replace('games-roles-', '')) {
      case 'create':
        await this.gameCreator.sendCreateGameModal(interaction);
        break;
      case 'activate':
        await this.gameActivator.sendActivateSelectMenu(interaction);
        break;
      case 'deactivate':
        await this.gameActivator.sendDeactivateSelectMenu(interaction);
        break;
      case 'archive':
        await this.gameArchiver.sendArchiveSelectMenu(interaction);
        break;
      case 'unarchive':
        await this.gameArchiver.sendUnArchiveSelectMenu(interaction);
        break;
      case 'send-message':
        await MessageHelper.sendSendMessageModal(interaction);
        break;
      case 'join':
        await MessageHelper.sendGameSelectionMenu(interaction);
        break;
      default:
        Logger.error(`Unknown button interaction! CustomId: ${interaction.customId}`);
        await interaction.reply({ content: 'Unknown button interaction!', ephemeral: true });
    }
  }

  /**
   * Manage select menu interactions
   * 
   * @param interaction Interaction received
   */
  private manageSelectMenuInteractions(interaction: SelectMenuInteraction): Promise<void> {
    if (!interaction.customId.startsWith('games-roles-')) {
      return ;
    }

    switch(interaction.customId.replace('games-roles-', '')) {
      case 'activate':
        this.gameActivator.activateGame(interaction);
        break;
      case 'deactivate':
        this.gameActivator.deactivateGame(interaction);
        break;
      case 'archive':
        this.gameArchiver.archiveGame(interaction);
        break;
      case 'unarchive':
        this.gameArchiver.unarchiveGame(interaction);
        break;
      case 'join-selected':
        this.manageJoinInteraction(interaction);
        break;
      
      default:
        Logger.error(`Unknown select menu interaction! CustomId: ${interaction.customId}`);
        interaction.reply({ content: 'Unknown select menu interaction!', ephemeral: true });
    }
  }

  /**
   * Manage select menu interactions 
   * 
   * @param interaction Interaction received
   */
   private manageModalSubmitInteractions(interaction: ModalSubmitInteraction): Promise<void> {
    if (!interaction.customId.startsWith('games-roles-')) {
      return ;
    }

    switch(interaction.customId.replace('games-roles-', '')) {
      case 'send-message':
        MessageHelper.sendJoinMessage(interaction);
        break;
      case 'create-game':
        this.gameCreator.createGame(interaction);
        break;
      default:
        Logger.error(`Unknown modal interaction! CustomId: ${interaction.customId}`);
    }
  }

  /**
   * Manage interaction happening when a user selected its roles in the join select menu
   * 
   * @param interaction Interaction received containing selected roles 
   * @returns Nothing
   */
  private async manageJoinInteraction(interaction: SelectMenuInteraction): Promise<void> {
    await interaction.deferUpdate();

    if (!interaction.values) return ;

    const member: GuildMember = await this.guild.members.fetch(interaction.member.user.id);
    const games = await Game.getGamesWithRolesForGuild(interaction.guildId);

    await Promise.all(games.map(async (game: IGame) => {
      try {
        await this.manageInteractionForGame(interaction, game, member);
      } catch (error) {
        Logger.warn(error);
      }
    }));

    const message = await interaction.editReply({ content: 'Roles updated!', components: []});
    if (message.flags != MessageFlags.FLAGS.EPHEMERAL) {
      setTimeout(() => { interaction.deleteReply(); }, 5000);
    }
  }

  private async manageInteractionForGame(interaction: SelectMenuInteraction, game: IGame, member: GuildMember) {

    // Get guildGame
    const guildGame = game.guildGames.find(g => g.guildId === interaction.guildId);

    if (!guildGame || !guildGame.roleId) {
      throw `An error occurred for game with applicationId ${game.applicationId} in guild ${interaction.guildId}`;
    }

    if (interaction.values.includes(game.applicationId)) {
      await member.roles.add(guildGame.roleId);
    } else {
      await member.roles.remove(guildGame.roleId);
    }
  }

  /**
   * Bans a game from the game list
   * 
   * @param interaction Interaction containing the ID of the game to ban
   */
  private async banGame(interaction: ButtonInteraction): Promise<void> {

    if (interaction.deferred || interaction.replied) {
      return ;
    }

    const applicationId = interaction.customId.replace(/games-roles-ban-game-/g,'');

    await Game.updateOne({ applicationId: applicationId }, { banned: true });
    const messageEmbed = new MessageEmbed()
      .setColor('#FF0000')
      .setDescription(`Game with applicationId ${applicationId} was banned`)
      .setTitle('Log');
    await interaction.update({ embeds: [messageEmbed], components: [] });
  }

  private onNewGuildMember(member: GuildMember) {
    if (member.user.id !== Bot.getId()) {
      this.activityScanner.scanGuildMember(member);
    }
  }
}