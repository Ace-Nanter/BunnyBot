import { GuildMember } from 'discord.js';
import ytdl = require("ytdl-core");

/**
 * Contains data for the music queue of the server
 */
export interface ISong {
  info: ytdl.videoInfo;
  title: string;
  url: string;
  duration: number;
  formattedDuration: string;
  member: GuildMember;
}