import { MessageEmbed } from "discord.js";
import { Song } from "./song.model";

/**
 * Contains data for the music queue of a server
 */
 export class MusicQueue {
  
  private songIndex = 0;
  public songs: Song[];

  public constructor() {
    this.songs = [];
  }  

  /**
   * Adds a song in queue
   * @param song Song to add in the queue
   */
  public pushSong(song: Song): void {
    this.songs.push(song);
  }

  /**
   * Tells if there is a next song available
   * @returns True if there is one, otherwise false
   */
  public hasNext(): boolean {
    return this.songIndex < (this.songs.length - 1);
  }

  /**
   * Tells if there is a previous song available
   * @returns True if there is one, otherwise false
   */
  public hasPrevious(): boolean {
    return this.songIndex > 0;
  }

  /**
   * Tells if the queue is empty
   * @returns True if queue is empty, otherwise false
   */
  public isEmpty(): boolean {
    return this.songs.length === 0;
  }

  /**
   * Tells if all the songs from the queued has been played
   * @returns True if the queue is at its end, otherwise false
   */
  public hasReachEnd(): boolean {
    return this.songIndex === (this.songs.length - 1);
  }

  /**
   * Get the song currently selected by the queue index
   * @returns the current song
   */
  public get currentSong(): Song {
    return this.songs[this.songIndex];
  }

  /**
   * Move index to next song
   */
  public next(): void {
    if (this.songIndex < (this.songs.length - 1)) {
      this.songIndex++;
    }
  }

  /**
   * Move index to previous song
   */
  public previous(): void {
    if (this.songIndex > 0) {
      this.songIndex--;
    }
  }

  /**
   * Add song list to the given message
   * @param message Given message in which a field containing song list should be added
   * @param isPlaying Tells if the music is currently being played or not
   */
  public addSongList(message: MessageEmbed, isPlaying: boolean): void {
    if(this.songs.length > 0) {
      message.addField('Music queue', this.formatSongList(isPlaying));
    } else {
      message.addField('No music queued', '\u200B');
    }
  }

  /**
   * Writes the list of every song in the queue.
   * Given a song, return the markdown formatted string to link to a song's URL
   * where the text is the title of the song
   *
   * @param isPlaying Tells if the music is currently being played or not
   * @returns a markdown formatted list
   */
  private formatSongList(isPlaying: boolean): string {
    let result = '';

    this.songs.slice(-5).forEach((song: Song) => {
      const index = this.songs.indexOf(song);
      result += `${index === this.songIndex && isPlaying ? '▶': (index + 1)} - [${song.title}](${song.url}) (${song.formattedDuration}) [${song.member}]\n\n`;
    });

    return result;
  }
}