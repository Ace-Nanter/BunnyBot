import { Message, MessageEmbed, MessageReaction, Snowflake, TextChannel, User } from "discord.js";
import { Bot } from "../../../bot";
import { MapUtils } from './../../../utils/map.utils';
import { AmongUsGame } from "./among-us-game.model";
import { Player } from './player.model';

export class MessageManager {

  private static readonly DEBOUNCE_TIME: number = 3000;
  private static readonly DELETE_EMOJI: string = '❌';

  private static readonly emojiMap: Map<number, string> = new Map([
    [0, '0⃣'],
    [1, '1⃣'],
    [2, '2⃣'],
    [3, '3⃣'],
    [4, '4⃣'],
    [5, '5⃣'],
    [6, '6⃣'],
    [7, '7⃣'],
    [8, '8⃣'],
    [9, '9⃣'],
    [10, '🔟']
  ]);

/*
  private static readonly colorMap: Map<PlayerColor, string> = new Map([
    [PlayerColor.Red, '16711680'],
    [PlayerColor.Blue, '255'],
    [PlayerColor.Green, '65280'],
    [PlayerColor.Pink, '16711935'],
    [PlayerColor.Orange, '16753920'],
    [PlayerColor.Yellow, '16776960'],
    [PlayerColor.Black, '0'],
    [PlayerColor.White, '16777215'],
    [PlayerColor.Purple, '9662683'],
    [PlayerColor.Brown, '9127187']
  ]);
*/

  private textChannel: TextChannel;
  private message: Message;
  private timer: NodeJS.Timeout;

  private reactionMap: Map<string, MessageReaction>;

  constructor(textChannel: TextChannel) {
    this.textChannel = textChannel;
    this.reactionMap = new Map();
  }

  public initMessage(game: AmongUsGame): void {
    if(!this.message) {
      this.textChannel.send(this.buildEmbedMessage(game)).then((message: Message) => {
        this.message = message;
      });
    }
  }

  public get messageId(): Snowflake {
    return this.message.id;
  }

  /**
   * Manage the timer when a player update is received
   * @param game Game data
   */
  public onPlayerUpdate(game: AmongUsGame): void {
    if(this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      clearTimeout(this.timer);
      this.timer = null;
      this.createOrUpdateMessage(game);
    }, MessageManager.DEBOUNCE_TIME);
  }

  /**
   * Update or send a message when player joined or left the game
   * @param game Game data
   */
  private createOrUpdateMessage(game: AmongUsGame): void {

    const contentEmbed: MessageEmbed = this.buildEmbedMessage(game);

    if(!this.message) {
      this.textChannel.send(contentEmbed).then((message: Message) => {
        this.message = message;
        this.setReactions(game);
      });
    }
    else {
      
      this.message.edit(contentEmbed).then((message: Message) => this.setReactions(game));
    }
  }

  /**
   * Manage reaction when it comes
   * @param reaction 
   * @param user 
   * @param game 
   */
  public manageReaction(reaction: MessageReaction, user: User, game: AmongUsGame): void {

    if(reaction.emoji.name === MessageManager.DELETE_EMOJI) {
      game.snowflakeToName.delete(user.id);
      this.onPlayerUpdate(game);
    }
    else {
      const name = MapUtils.lookByValue<string, MessageReaction>(this.reactionMap, reaction);

      if(name) {
        game.snowflakeToName.set(user.id, name);
        this.onPlayerUpdate(game);
      }
    }

    reaction.remove();
  }

  /**
   * Build the embed message to send
   * @param content Content to add inside the embed message
   * @returns The embed message to send
   */
  private buildEmbedMessage(game: AmongUsGame): MessageEmbed {
    
    let index;
    let content: string = '';
    let contentEmbed = new MessageEmbed();

    contentEmbed.setAuthor(Bot.getClient().user.username, Bot.getClient().user.avatarURL());
    contentEmbed.setTitle('Qui êtes-vous ?');

    // contentEmbed.setThumbnail('');   TODO : set among us link
    // TODO : set game code

    game.players.forEach((player: Player, name: string) => {
      content += MessageManager.emojiMap.get(player.index) + ' - ' + name;

      // If the user is already identified
      const snowflake: Snowflake = MapUtils.lookByValue(game.snowflakeToName, name);
      if(snowflake) {
        content += ` : <@${snowflake}>`;
      }

      content += '\n';
      index++;
    });

    content += '\nMerci de cocher la réaction qui correspond à votre nom dans le jeu !';
    content += "\nVous pouvez utiliser l'emoji " + MessageManager.DELETE_EMOJI + ' pour séparer votre compte Discord à votre nom Among Us';
    contentEmbed.setDescription(content);

    return contentEmbed;
  }

  /**
   * Set reactions after sending or editing a message
   */
  private setReactions(game: AmongUsGame): void {
    
    this.clearReactions(game);
    
    game.players.forEach((player: Player, name: string) => {
      if(!MapUtils.lookByValue(game.snowflakeToName, name)) {
        this.message.react(MessageManager.emojiMap.get(player.index)).then((reaction: MessageReaction) => {
          this.reactionMap.set(name, reaction);
        });
      }
    });

    this.message.react(MessageManager.DELETE_EMOJI);
  }

  /**
   * Clear reactions which are no longer needed 
   * @param game Among Us Game containing data
   */
  private clearReactions(game: AmongUsGame): void {

    let playerToDelete: string[] = [];

    this.reactionMap.forEach((reaction: MessageReaction, name: string) => {
      
      // If player is disconnected or changed name
      if(!game.players.has(name)) {
        playerToDelete.push(name);
      }

      // If player is already associated
      if(MapUtils.lookByValue(game.snowflakeToName, name)) {
        playerToDelete.push(name);
      }
    });

    playerToDelete.forEach((name: string) => {
      this.reactionMap.get(name).remove();    // Remove reaction
      this.reactionMap.delete(name);
    });
  }
}