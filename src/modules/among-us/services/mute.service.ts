import { GuildMember, VoiceChannel } from "discord.js";
import { AmongUsGame } from "../models/among-us-game.model";

export class MuteService {
  
  public static muteEveryone(channel: VoiceChannel, game: AmongUsGame, muted: boolean): void {
    channel.members.forEach((member: GuildMember) => {
      
      // Look for a player associated to the member
      const player = game.players.get(game.snowflakeToName.get(member.id));

      if(player && player.dead) {
        member.voice.setMute(!muted);
      }
      else {
        member.voice.setDeaf(muted);
      }
    });
  }

  /**
   * Reset everyone's status
   * @param channel voice channel 
   */
  public static resetEveryone(channel: VoiceChannel) {
    channel.members.forEach((member: GuildMember) => {
      member.voice.setMute(false);
      member.voice.setDeaf(false);
    });
  }

  /**
   * unDeaf a specific player given its name
   * @param channel voice channel
   * @param name player's name to undeaf
   * @param game Game object
   */
  public static unDeafPlayer(channel: VoiceChannel, name: string, game: AmongUsGame): void {
    channel.members.forEach((member: GuildMember) => {
      const player = game.players.get(game.snowflakeToName.get(member.id));

      if(player.name === name) {
        member.voice.setDeaf(false);
      }
    });
  }
}