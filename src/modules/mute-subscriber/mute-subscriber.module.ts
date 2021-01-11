import { Command } from './../../models/command/command.model';
import { Permission } from './../../models/command/permission.enum';
import { VoiceChannel, VoiceState } from "discord.js";
import { BotModule } from "../common/bot-module";

export class MuteSubscriberModule extends BotModule {

  private targetChannel: VoiceChannel;
  private targetUserID: string;

  constructor(params: any) {
    super(params);

    this.callbacks = new Map();
    this.callbacks.set('voiceStateUpdate', this.onGuildMemberSpeaking);

    this.commands = new Map();
    this.commands.set('mute-subscribe', new Command('mute-subscribe', Permission.OWNER, null));
    this.commands.set('mute-unsubscribe', new Command('mute-unsubscribe', Permission.OWNER, null));

    if (params) {
      this.init(params);
    }
  }

  private onGuildMemberSpeaking(oldState: VoiceState, newState: VoiceState) {
    if (oldState.member.id === this.targetUserID) {
      if (oldState.selfMute === false && newState.selfMute === true) {
        this.changeEveryoneMuteStatus(true);
      }
      else if (oldState.selfMute === true && newState.selfMute === false) {
        this.changeEveryoneMuteStatus(false);
      }
    }
  }

  private init(params: any[]) {
    const targetChannelID = params['targetChannel'] ? params['targetChannel'] : null;
    

    // TODO : create webserver
  }

  private changeEveryoneMuteStatus(status: boolean): void {
    this.targetChannel.members.forEach(member => {
      if(member.id !== this.targetUserID) {
        member.voice.setMute(status);
      }
    });
  }
}