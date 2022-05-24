import { Guild, Snowflake } from "discord.js";
import { Bot } from "../../bot";
import { Logger } from "../../logger/logger";
import { BotModule } from "../../models/bot-module.model";
import { Game } from "./models/game.model";
import { ActivityScanner } from "./services/activity-scanner.service";

export class GamesRolesModule extends BotModule {

  private activityScanner: ActivityScanner;
  private guild: Guild;

  protected initCallbacks(): void {
    //this.callbacks.set('guildMemberAdd', GamesRolesModule.onGuildMemberAdd);
  }

  protected initCommands(): void {
    return ;
  }

  protected async initModule(params?: any[]): Promise<void> {

    try {
      this.guild = await Bot.getClient().guilds.fetch(this.guildId);

      this.activityScanner = new ActivityScanner(this.guild);
      this.activityScanner.start();
    } catch (error) {
      Logger.error(error);
    }    

  //   if (params) {
      

  //     try {
  //       this.getAndCheckParams(params);
  //       this.retrieveGames();
  // /*
  //       for each games
  //       this.initChannel();
  //       this.initEmoji();
  //       this.initRole();
  
  // */
  //       // this.writeGameList();
  //       // this.startScanning();
  //     }
  //     catch(e) {
  //       Logger.error(e);
  //     }



  //   }

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
   * Retrieves and check parameters given to module's instance
   * @param params Parameters given
   */
  private getAndCheckParams(params: any[]): void {



    // if(params['roleChannelId']) {
    //   throw new error("Incorrect parameters");
    // }

    // this.channelId = params['roleChannelId'] ? params['roleChannelId'] : null;
    
    // GamesRolesModule.fetchFrequency = params['fetchingFrequency'] ? params['fetchingFrequency'] : 30000;
    // GamesRolesModule.scanFrequency = params['fetchingFrequency'] ? params['scanFrequency'] : 60000;

    // TODO : check parameters for scanning? 
  }

  /**
   * Retrieves game list from MongoDB
   * @returns Game list retrieved from MongoDB
   */
  private retrieveGames(): Game[] {

    // Get by


    return null;
  }

  // private stop() {
  //   clearInterval(this.fetchTimer);
  //   clearInterval(this.scanTimer);
  // }
}