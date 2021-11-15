import { AudioPlayer, AudioPlayerStatus, createAudioPlayer, createAudioResource, DiscordGatewayAdapterCreator, entersState, getVoiceConnection, joinVoiceChannel, StreamType, VoiceConnection, VoiceConnectionDisconnectReason, VoiceConnectionStatus } from '@discordjs/voice';
import { Guild, StageChannel, VoiceChannel } from 'discord.js';
import { Logger } from '../../../logger/logger';
import { MusicModule } from '../music.module';
import { MusicQueue } from './music-queue.model';
import { MusicStatusMessage } from './music-status-message.model';
import { Song } from './song.model';

import ytdl = require('ytdl-core');

/**
 * Manage music for a guild
 */
 export class GuildMusic {
  
  private queue: MusicQueue;
  private audioPlayer: AudioPlayer;
  public statusMessage: MusicStatusMessage;
  private playing: boolean;
  private paused: boolean;
  private repeating: boolean;

  public constructor(
    private guild: Guild,
    public voiceChannel: VoiceChannel | StageChannel
  ) {
    this.queue = new MusicQueue();
    this.audioPlayer = null;
    this.playing = false;
    this.repeating = false;

    this.statusMessage = new MusicStatusMessage(this, guild);
  }

  public get musicQueue(): MusicQueue {
    return this.queue;
  }

  public get isPlaying(): boolean {
    return this.playing;
  }

  public get isPaused(): boolean {
    return this.paused;
  }

  public get isRepeating(): boolean {
    return this.repeating;
  }

  /**
   * Starts playing queue
   */
  public play(): void {
    if (!this.playing) {
      // If a new queue was created then we immediately play the song
      this.playNextSong();
    }
  }

  /**
   * Pause music
   */
  public pause(): void {
    this.audioPlayer.pause();
    this.paused = true;

    this.statusMessage.refresh();
  }

  /**
   * Unpause music
   */
  public unpause(): void {
    if(!this.paused) return;

    this.audioPlayer.unpause();
    this.paused = false;

    this.statusMessage.refresh();
  }

  /**
   * Go to previous song
   */
  public rewind(): void {
    this.queue.previous();
    this.playNextSong();

    this.statusMessage.refresh();
  }

  /**
   * Go to next song
   */
  public fastForward(): void {
    this.queue.next();
    this.playNextSong();

    this.statusMessage.refresh();
  }

  /**
   * Displays delete menu for member to select songs to remove from queue
   */
  public displayDeleteMenu(): void {
    this.statusMessage.refresh(true);
  }

  /**
   * Removed selected songs from queue
   */
  public removeFromQueue(values: string[]): void {
    values.forEach((value: string) => {
      this.queue.remove(parseInt(value));
    });

    this.statusMessage.refresh();
  }

  /**
   * Plays the next song in the queue. Once the song ends, pop it from the
   * queue and recursively call this function
   *
   * @param guildId the id of the server the bot is playing music in
   * @param musicQueue a map from a server's id to it's music queue
   * @returns a message saying which song it is currently playing
   */
   private async playNextSong(): Promise<void> {

    // Base case
    if (this.queue.isEmpty()) {
      return this.handleEmptyQueue();
    }

    const connection = await this.connectToChannel(this.voiceChannel);
    const song = this.queue.currentSong;
    this.getSongPlayer(song).then((audioPlayer: AudioPlayer) => {
      this.audioPlayer = audioPlayer;
      connection.subscribe(this.audioPlayer);
      this.playing = true;

      this.audioPlayer.on(AudioPlayerStatus.Idle, () => {
        this.playing = false;
        this.handleSongFinish();
      });

      this.statusMessage.refresh();
    }, (error) => {
      Logger.error(`Something happened for the song ${song.title}: ${error}`);
      this.queue.next();
      this.playNextSong();
    });
  }

  /**
   * Given the song, create an audio player for the song, or throw an
   * error if it does not start playing in 5 seconds
   *
   * @param song the song to play
   * @returns a promise to the created audio player
   */
  private async getSongPlayer(song: Song): Promise<AudioPlayer> {

    const player = createAudioPlayer();
    const stream = ytdl(song.url, {
      filter: 'audioonly',
      highWaterMark: 1 << 25, // Set buffer size
    });

    const resource = createAudioResource(stream, {
      inputType: StreamType.Arbitrary,
    });

    player.play(resource);

    return entersState(player, AudioPlayerStatus.Playing, 5_000);
  }

  /**
   * Connect to a voice channel and returns the VoiceConnection. If we
   * cannot connect within 30 seconds, throw an error
   *
   * @param channel the voice channel to connect to
   * @returns the VoiceConnection after we connect
   */
  private async connectToChannel(channel: VoiceChannel | StageChannel): Promise<VoiceConnection> {
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: (channel.guild.voiceAdapterCreator as unknown as DiscordGatewayAdapterCreator),
    });
 
    try {
      await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
      connection.on('stateChange', async (_, newState) => {
        if (newState.status === VoiceConnectionStatus.Disconnected) {
          if (newState.reason === VoiceConnectionDisconnectReason.WebSocketClose && newState.closeCode === 4014) {
            /**
             * If the websocket closed with a 4014 code, this means that we
             * should not manually attempt to reconnect but there is a chance
             * the connection will recover itself if the reason of disconnect
             * was due to switching voice channels. This is also the same code
             * for being kicked from the voice channel so we allow 5 s to figure
             * out which scenario it is. If the bot has been kicked, we should
             * destroy the voice connection
             */
            try {
              await entersState(
                connection,
                VoiceConnectionStatus.Connecting,
                5_000
              );
              // Probably moved voice channel
            } catch {
              connection.destroy();
              // Probably removed from voice channel
            }
          } else if (connection.rejoinAttempts < 5) {
            // The disconnect is recoverable, and we have < 5 attempts so we
            // will reconnect
            // await wait((connection.rejoinAttempts + 1) * 5_000);
            connection.rejoin();
          } else {
            // The disconnect is recoverable, but we have no more attempts
            connection.destroy();
          }
        }
      });
      return connection;
    } catch (error) {
      connection.destroy();
      this.statusMessage.delete();
      throw error;
    }
  }
  
  /**
   * Handles what to do when the the current song finishes. If the server has
   * repeat active, then add the new song. If the queue is not empty, plays the
   * next song.
   */
  private handleSongFinish(): void {
    if (!this.repeating) {
      if (this.queue.hasReachEnd()) {
        this.handleEmptyQueue();
      }
      else {
        this.queue.next();
        this.playNextSong();
      }
    }
  }

  /**
   * Handles what to do when the queue is empty. If there are no more members,
   * then leave immediate, else wait for a specified duration, and then leave.
   *
   */
  handleEmptyQueue(): void {
    this.statusMessage.refresh();

    // Wait for 1 minute and if there is no new songs, leave
    setTimeout(() => {
      if (this.queue.isEmpty() || this.queue.hasReachEnd()) {
        this.disconnect();
        // TODO : remove from module
        return;
      }
    }, MusicModule.STANDBY_DURATION);
  }

  /**
   * Disconnect from the guild
   */
  public disconnect(): void {
    const connection = getVoiceConnection(this.guild.id);

    if(connection) {
      connection.destroy();
    }
    
    this.statusMessage.delete();
  }
}