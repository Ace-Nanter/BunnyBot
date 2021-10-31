import { GuildMember } from 'discord.js';
import ytdl = require("ytdl-core");
import ytsr = require('ytsr');
import { Logger } from '../../../logger/logger';

export class Song {
  info: ytdl.videoInfo;
  title: string;
  url: string;
  duration: number;
  formattedDuration: string;
  member: GuildMember;
  
  public static async initSong(arg: string, member: GuildMember): Promise<Song> {

    const song = new Song();

    let songInfo: ytdl.videoInfo = null;
    try {
      songInfo = await song.getSongInfo(arg);
    } catch (error) {
      Promise.reject(error);
    }

    if (songInfo === null) {
      Promise.resolve(null);
    }

    // Create the song object
    const duration = parseInt(songInfo.videoDetails.lengthSeconds);
    
    song.info = songInfo;
    song.title = songInfo.videoDetails.title;
    song.url = songInfo.videoDetails.video_url;
    song.duration = duration;
    song.formattedDuration = song.formatDuration();
    song.member = member;

    return song;
  }

  /**
   * Read the user's arguments and get the song from youtube
   *
   * @param arg the argument of the user
   * @returns the song info of their desired song
   */
   private async getSongInfo(arg: string): Promise<ytdl.videoInfo> {
    let songInfo = null;
    let songUrl = arg;

    // Search for the song if the url is invalid
    if (!ytdl.validateURL(songUrl)) {
      try {
        const searchString = await ytsr.getFilters(songUrl);
        const videoSearch = searchString.get('Type').get('Video');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const results: any = await ytsr(videoSearch.url, {
          limit: 1,
        });

        songUrl = results.items[0].url;
      } catch (error) {
        Logger.error(error);
        throw 'Error searching for the song';
      }
    }
    try {
      // Find the song details from URL
      songInfo = await ytdl.getInfo(songUrl);
    } catch (error) {
      Logger.error(error);
      throw 'Error getting the video from the URL';
    }
    return songInfo;
  }

  /**
   * Returns a duration formatted in (MM:HH:SS) or (MM:SS) if it is less than an
   * hour. If it is a livestream, then send the string 'livestream'
   *
   * @param seconds the duration in seconds
   * @returns a formatted version of the duration
   */
   private formatDuration(): string {
    if (this.duration === 0) {
      return 'livestream';
    } else if (this.duration < 3600) {
      return new Date(this.duration * 1000).toISOString().substr(14, 5);
    } else {
      return new Date(this.duration * 1000).toISOString().substr(11, 8);
    }
  }
}