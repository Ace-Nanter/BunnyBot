import { VoiceChannel } from "discord.js";

export class MuteService {
  
  public static muteEveryone(channel: VoiceChannel, muted: boolean) {
    channel.members.forEach(member => {
      member.voice.setMute(muted);
    });
  }
}