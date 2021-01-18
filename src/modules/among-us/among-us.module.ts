import { MessageReaction, TextChannel, User, VoiceChannel } from "discord.js";
import { Bot } from '../../bot';
import { Logger } from '../../logger/logger';
import { Command } from '../../models/command/command.model';
import { Permission } from '../../models/command/permission.enum';
import { BotModule } from "../common/bot-module";
import { AmongUsGame } from './models/among-us-game.model';
import { GameState } from './models/game-state.enum';
import { MessageManager } from './models/message-manager.model';
import { PlayerAction, PlayerUpdate as PlayerUpdate } from "./models/player-update.model";
import { MuteService } from "./services/mute.service";
import { ServerService } from './services/server.service';

export class AmongUsModule extends BotModule {

  private voiceChannel: VoiceChannel;
  private textChannel: TextChannel;

  private game: AmongUsGame;
  private messageManager: MessageManager;

  constructor(params: any) {
    super(params);

    this.callbacks = new Map();
    this.callbacks.set('messageReactionAdd', (reaction: MessageReaction, user: User) => { this.onMessageReactionAdd(reaction, user); });

    this.commands = new Map();
    this.commands.set('mute-subscribe', new Command('mute-subscribe', Permission.OWNER, null));
    this.commands.set('mute-unsubscribe', new Command('mute-unsubscribe', Permission.OWNER, null));

    if (params) {
      this.init(params);
    }
  }

  private init(params: any[]) {
    const targetVoiceChannelID = params['targetVoiceChannel'] ? params['targetVoiceChannel'] : null;
    const targetTextChannelID = params['targetTextChannel'] ? params['targetTextChannel'] : null;
    
    this.game = new AmongUsGame();

    // Fetch voice channel
    Bot.getClient().channels.fetch(targetVoiceChannelID).then(channel => {
      if(channel.type !== 'voice') {
        Logger.error('Among Us Module: channel in config is not a voice channel!');
      }
      else {
        this.voiceChannel = channel as VoiceChannel;
      }
    }, error => {
      Logger.error(error);
    }); 

    // Fetch text channel
    Bot.getClient().channels.fetch(targetTextChannelID).then(channel => {
      if(channel.type !== 'text') {
        Logger.error('Among Us Module: channel in config is not a text channel!');
      }
      else {
        this.textChannel = channel as TextChannel;
        this.messageManager = new MessageManager(this.textChannel);
      }
    }, error => {
      Logger.error(error);
    }); 

    ServerService.init(6000);
    ServerService.eventEmitter.on('onGameStateChanged', (newGameState: GameState) => this.onGameStateChanged(newGameState));
    ServerService.eventEmitter.on('onPlayerChanged', (playerUpdate: PlayerUpdate) => this.onPlayerStatusChanged(playerUpdate));
    ServerService.eventEmitter.on('onReset', () => { this.game = null; });
  }

  /**
   * Method triggered when a new game state is received
   * @param newGameState New game state
   */
  private onGameStateChanged(newGameState: GameState): void {
    if(!this.game) {
      this.game = new AmongUsGame();
    }

    switch(newGameState) {
      case GameState.DISCUSSION:
        MuteService.muteEveryone(this.voiceChannel, this.game, false);
        break;
      case GameState.LOBBY:
        this.resetEveryone();
        this.messageManager.initMessage(this.game);
        break;
      case GameState.ENDED:
        this.resetEveryone();
        break;
      case GameState.TASKS:
        MuteService.muteEveryone(this.voiceChannel, this.game, true);
        break;
      case GameState.MENU:
        this.resetEveryone();
        break;
      default:
        Logger.error('Unknown game state received!');
        break;
    }
  }

  private onPlayerStatusChanged(playerUpdate: PlayerUpdate): void {
    if(!this.game) {
      this.game = new AmongUsGame();
    }
    
    const player = this.game.players.get(playerUpdate.name);

    switch(playerUpdate.action) {
      case PlayerAction.Joined:
        this.game.addPlayer(playerUpdate);
        this.messageManager.onPlayerUpdate(this.game);
        break;
        
      case PlayerAction.Died:
      case PlayerAction.Exiled:
        player.update(playerUpdate);
        MuteService.unDeafPlayer(this.voiceChannel, player.name, this.game);
        break;

      case PlayerAction.Disconnected:
      case PlayerAction.Left:
        this.game.deletePlayer(playerUpdate.name);
        this.messageManager.onPlayerUpdate(this.game);
        break;
    }
  }

  private onMessageReactionAdd(reaction: MessageReaction, user: User) : void {

    const clientId = Bot.getId();

    if(user.id !== clientId && this.messageManager && this.messageManager.messageId === reaction.message.id) {
      this.messageManager.manageReaction(reaction, user, this.game);
    }
  }

  private resetEveryone(): void {
    if(this.game.players && this.game.players.size > 0) {
      this.game.players.forEach(player => {
        player.reset();
      });  
    }
    
    MuteService.resetEveryone(this.voiceChannel);
  }
}