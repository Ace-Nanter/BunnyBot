import { AudioPlayer } from "@discordjs/voice";
import { Message, StageChannel, TextChannel, VoiceChannel } from "discord.js";
import { ISong } from "./song.interface";

/**
 * Contains data for the music queue of a server
 */
 export interface IServerMusicQueue {
  voiceChannel: VoiceChannel | StageChannel;
  textChannel: TextChannel;
  songs: ISong[];
  audioPlayer: AudioPlayer;
  playingMessage: Message;
  isPlaying: boolean;
  isRepeating: boolean;
}