import { TextChannel, VoiceChannel } from "discord.js";
import { Bot } from '../../bot';
import { Logger } from '../../logger/logger';
import { Command } from '../../models/command/command.model';
import { Permission } from '../../models/command/permission.enum';
import { BotModule } from "../common/bot-module";
import { AmongUsGame } from './models/among-us-game.model';
import { GameState } from './models/game-state.enum';
import { PlayerAction, PlayerUpdate as PlayerUpdate } from "./models/player-update.model";
import { Player } from "./models/player.model";
import { MessageService } from "./services/message.service";
import { MuteService } from "./services/mute.service";
import { ServerService } from './services/server.service';

export class AmongUsModule extends BotModule {

  private voiceChannel: VoiceChannel;
  private textChannel: TextChannel;
  private game: AmongUsGame;

  constructor(params: any) {
    super(params);

    this.callbacks = new Map();
    // this.callbacks.set('voiceStateUpdate', this.onVoiceStateUpdate);

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
      }
    }, error => {
      Logger.error(error);
    }); 

    ServerService.init(6000);
    ServerService.eventEmitter.on('onGameStateChanged', (newGameState: GameState) => this.onGameStateChanged(newGameState));
    ServerService.eventEmitter.on('onPlayerChanged', (playerUpdate: PlayerUpdate) => this.onPlayerStatusChanged(playerUpdate));
  }

  private onGameStateChanged(newGameState: GameState): void {
    switch(newGameState) {
      case GameState.DISCUSSION:
        MuteService.muteEveryone(this.voiceChannel, false);
        break;
      case GameState.LOBBY:
        MuteService.muteEveryone(this.voiceChannel, false);
        MessageService.createMessage(this.textChannel);
        break;
      case GameState.ENDED:
        MuteService.muteEveryone(this.voiceChannel, false);
        break;
      case GameState.TASKS:
        MuteService.muteEveryone(this.voiceChannel, true);
        break;
      case GameState.MENU:
        MuteService.muteEveryone(this.voiceChannel, false);
        break;
      default:
        Logger.error('Unknown game state received!');
        break;
    }
  }

  private onPlayerStatusChanged(playerUpdate: PlayerUpdate): void {
    switch(playerUpdate.action) {
      case PlayerAction.Joined:
        // Adding player in list
        this.game.players.set(playerUpdate.name, new Player(playerUpdate));
        // this.messageManage(this.game);
        break;
      case PlayerAction.Left:
        this.game.players.get(playerUpdate.name).update(playerUpdate);

        // TODO : modify to remove

        break;
      case PlayerAction.Died:
        this.game.players.get(playerUpdate.name).update(playerUpdate);
        break;
      case PlayerAction.ChangedColor:
        this.game.players.get(playerUpdate.name).update(playerUpdate);
        break;
      case PlayerAction.ForceUpdated:
        break; 
      case PlayerAction.Disconnected:
        this.game.players.get(playerUpdate.name).update(playerUpdate);

        // TODO : modify to remove

        break;
      case PlayerAction.Exiled:
        this.game.players.get(playerUpdate.name).update(playerUpdate);
        break;
    }

    // TODO : garder stocker les utilisateurs, supprimer lorsque le jeu est éteint (nécessité d'envoyer un message pour ça).
    // 
  }
}