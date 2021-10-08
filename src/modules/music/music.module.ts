import { BotModule } from "../../models/modules/bot-module.model";
import { IServerMusicQueue } from "./models/server-music-queue.interface";
import { default as PlayCommandClass } from './commands/play.command';
import { ISong } from "./models/song.interface";

export class MusicModule extends BotModule {

  public static readonly STANDBY_DURATION = 600000;

  musicQueue: Map<string, IServerMusicQueue>;

  constructor(params: any) {
    super();

    this.callbacks = new Map();

    this.commands = [];
    this.commands.push(new PlayCommandClass(this));

    this.musicQueue = new Map();
  }

  /**
   * Returns a duration formatted in (MM:HH:SS) or (MM:SS) if it is less than an
   * hour. If it is a livestream, then send the string 'livestream'
   *
   * @param seconds the duration in seconds
   * @returns a formatted version of the duration
   */
  public formatDuration(seconds: number): string {
    if (seconds === 0) {
      return 'livestream';
    } else if (seconds < 3600) {
      return new Date(seconds * 1000).toISOString().substr(14, 5);
    } else {
      return new Date(seconds * 1000).toISOString().substr(11, 8);
    }
  }

  /**
   * Given a song, return the markdown formatted string to link to a song's URL
   * where the text is the title of the song
   *
   * @param song the current song
   * @returns a markdown formatted link
   */
   public getFormattedLink(song: ISong): string {
    return `[${song.title}](${song.url})`;
  }
}