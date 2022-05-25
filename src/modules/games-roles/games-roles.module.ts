import { ButtonInteraction, CategoryChannel, Guild, Interaction, ModalSubmitInteraction, SelectMenuInteraction } from 'discord.js';
import { Bot } from '../../bot';
import { Logger } from '../../logger/logger';
import { BotModule } from '../../models/bot-module.model';
import { default as GamesRolesCommand } from './commands/game.command-group';
import { MessageHelper } from './helpers/message.helper';
import { Game, IGame } from './models/game.model';
import { ActivityScanner } from './services/activity-scanner.service';
import { GameManager } from './services/game-manager.service';
import { RoleManager } from './services/role-manager.service';

const GAME_CATEGORY_CHANNEL_ID = 'gameCategoryChannelId';
const ARCHIVE_CATEGORY_CHANNEL_ID = 'archiveCategoryChannelId';

export class GamesRolesModule extends BotModule {

  private activityScanner: ActivityScanner;
  private gameManager: GameManager;
  private roleManager: RoleManager;

  private guild: Guild;
  private gameCategory: CategoryChannel;
  private archiveCategory: CategoryChannel;

  protected initCallbacks(): void {
    this.callbacks.set('interactionCreate', async (interaction: Interaction) => { this.onInteraction(interaction); })
  }

  protected initCommands(): void {
    this.commands.push(new GamesRolesCommand(this));
  }

  protected async initModule(params: any[]): Promise<void> {
    try {
      this.guild = await Bot.getClient().guilds.fetch(this.guildId);

      await this.initParams(params);

      this.gameManager = new GameManager(this.guild, this.gameCategory, this.archiveCategory);
      this.roleManager = new RoleManager(this.guild);
      this.activityScanner = new ActivityScanner(this.guild);
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

  private async manageButtonInteraction(interaction: ButtonInteraction) {
    if (!interaction.customId.startsWith('games-roles-')) {
      return ;
    }
    
    if (interaction.customId.includes('ban-game-')) {
      this.banGame(interaction);
    }

    switch(interaction.customId.replace('games-roles-', '')) {
      case 'create':
        MessageHelper.sendCreateGameModal(interaction);
        break;
      case 'activate':
        MessageHelper.sendActivateSelectMenu(interaction);
        break;
      case 'deactivate':
        MessageHelper.sendDeactivateSelectMenu(interaction);
        break;
      case 'archive':
        MessageHelper.sendArchiveSelectMenu(interaction);
        break;
      case 'unarchive':
        MessageHelper.sendUnArchiveSelectMenu(interaction);
        break;
      case 'send-message':
        MessageHelper.sendSendMessageModal(interaction);
        break;
      case 'join':
        await MessageHelper.sendGameSelectionMenu(interaction);
        break;
      default:
        Logger.error(`Unknown button interaction! CustomId: ${interaction.customId}`);
        interaction.reply({ content: 'Unknown button interaction!', ephemeral: true });
    }
  }

  /**
   * Manage select menu interactions
   * 
   * @param interaction Interaction received
   */
  private manageSelectMenuInteractions(interaction: SelectMenuInteraction) {
    if (!interaction.customId.startsWith('games-roles-')) {
      return ;
    }

    switch(interaction.customId.replace('games-roles-', '')) {
      case 'activate':
        this.gameManager.activateGame(interaction);
        break;
      case 'deactivate':
        this.gameManager.deactivateGame(interaction);
        break;
      case 'archive':
        this.gameManager.archiveGame(interaction);
        break;
      case 'unarchive':
        this.gameManager.unarchiveGame(interaction);
        break;
      case 'join-selected':
        this.roleManager.manageSelectMenuInteraction(interaction);
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
   private manageModalSubmitInteractions(interaction: ModalSubmitInteraction) {
    if (!interaction.customId.startsWith('games-roles-')) {
      return ;
    }

    switch(interaction.customId.replace('games-roles-', '')) {
      case 'send-message':
        MessageHelper.sendJoinMessage(interaction);
        break;
      case 'create-game':
        this.gameManager.createGame(interaction);
        break;
      default:
        Logger.error(`Unknown modal interaction! CustomId: ${interaction.customId}`);
    }
  }

  /**
   * Bans a game from the game list
   * 
   * @param interaction Interaction containing the ID of the game to ban
   */
  private async banGame(interaction: ButtonInteraction): Promise<void> {
    const applicationId = interaction.customId.replace(/ban-game-/g,'');

    await Game.updateOne({ applicationId: applicationId }, { banned: true });
    interaction.update({ content: `Game with applicationId ${applicationId} was banned`, components: [] });
  }

  // private fetchMessage() {
  //   Bot.getClient().channels.fetch(GamesRolesModule.targetChannelID).then(c => {
  //     const channel = c as TextChannel;
  //     this.guild = channel.guild;             // Helps scan process
  //     channel.messages.fetch(GamesRolesModule.targetMessageID).then(message => {
  //       this.addReaction(message);
  //     }).catch(e => Logger.warn(`Games-Roles Module: Unable to find target message! ${e}`));
  //   });
  // }

  // private scanPlayersActivity() {
  //   this.guild.members.fetch().then(members => {
  //     members.forEach(member => {
  //       this.scanPlayer(member);
  //     });
  //   });
  // }

  // private scanPlayer(member: GuildMember) {
  //   if (member.presence && member.presence.status !== 'offline') {
  //     const activity = member.presence.activities.find(a => a.applicationId);
  //     if (activity) {
  //       const game = this.gamesTable.find(g => g.activityId === activity.applicationId);
  //       if (game) {
  //         this.guild.roles.fetch(game.roleId).then(role => {
  //           if (!member.roles.cache.has(role.id)) {
  //             member.roles.add(role);
  //             Logger.log(`Added role ${role.name} to ${member.user.username}!`);
  //           }
  //         }).catch(e => Logger.error(`Unable to find role associated to game ${game.gameName}: ${e}`));
  //       }
  //     }
  //   }
  // }

  // private addReaction(message: Message) {
  //   if (this.gamesTable && this.gamesTable.length > 0) {
  //     this.gamesTable.sort((g1, g2) => {
  //       if (g1.gameName < g2.gameName) { return -1; }
  //       if (g1.gameName > g2.gameName) { return 1; }
  //       return 0;
  //     }).forEach(game => {
  //       const reaction = message.reactions.cache.find(r => r.emoji.name === game.emojiName && r.me);
  //       if (!reaction) {
  //         const emoji = this.guild.emojis.cache.find(e => e.name === game.emojiName);
  //         if (emoji) {
  //           message.react(emoji);
  //         }
  //       }
  //     });
  //   }
  // }

  // private static async onMessageReactionAdd(messageReaction: MessageReaction, user: User) {

  //   const clientId = Bot.getId();

  //   if (user.id !== clientId && messageReaction.message.id === GamesRolesModule.targetMessageID
  //     && GamesRolesModule.instance && GamesRolesModule.instance.gamesTable) {
  //     const game = GamesRolesModule.instance.gamesTable.find(g => g.emojiName === messageReaction.emoji.name);
  //     if (game) {
  //       const member = await messageReaction.message.guild.members.fetch(user);

  //       messageReaction.message.guild.roles.fetch(game.roleId).then(role => {
  //         if (!member.roles.cache.has(game.roleId)) {
  //           member.roles.add(role);
  //           Logger.info(`Added role ${role.name} to ${user.username}`);
  //           member.createDM().then(channel => {
  //             channel.send(`Je t'ai ajouté le rôle **${role.name}**!`);
  //           });
  //         }
  //       }).catch(() => {
  //         Logger.warn(`Unable to find role associated to game ${game.gameName}`);
  //       });
  //     }
  //   }
  // }

  // private static async onMessageReactionRemove(messageReaction: MessageReaction, user: User) {

  //   const clientId = Bot.getId();

  //   if (user.id !== clientId && messageReaction.message.id === GamesRolesModule.targetMessageID
  //     && GamesRolesModule.instance && GamesRolesModule.instance.gamesTable) {
  //     const game = GamesRolesModule.instance.gamesTable.find(g => g.emojiName === messageReaction.emoji.name);
  //     if (game) {
  //       const member = await messageReaction.message.guild.members.fetch(user);

  //       messageReaction.message.guild.roles.fetch(game.roleId).then(role => {
  //         if (member.roles.cache.has(game.roleId)) {
  //           member.roles.remove(role);
  //           Logger.info(`Removed role ${role.name} from ${user.username}`);
  //           member.createDM().then(channel => {
  //             channel.send(`Je t'ai enlevé le rôle **${role.name}**!`);
  //           });
  //         }
  //       }).catch(() => {
  //         Logger.warn(`Unable to find role associated to game ${game.gameName}`);
  //       });
  //     }
  //   }
  // }

  // private static onGuildMemberAdd(member: GuildMember) {
  //   if (member.user.id !== Bot.getId() && GamesRolesModule.instance) {
  //     GamesRolesModule.instance.scanPlayer(member);
  //   }
  // }

  /**
   * Retrieves game list from MongoDB
   * @returns Game list retrieved from MongoDB
   */
  private retrieveGames(): IGame[] {

    // Get by


    return null;
  }

  // private stop() {
  //   clearInterval(this.fetchTimer);
  //   clearInterval(this.scanTimer);
  // }
}