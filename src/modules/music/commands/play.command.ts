import { AudioPlayer, AudioPlayerStatus, createAudioPlayer, createAudioResource, entersState, getVoiceConnection, joinVoiceChannel, StreamType, VoiceConnection, VoiceConnectionDisconnectReason, VoiceConnectionStatus } from "@discordjs/voice";
import { CommandPermission } from './../../../models/modules/command-permission.enum';
import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, Guild, GuildMember, MessageEmbed, StageChannel, TextChannel, VoiceChannel } from 'discord.js';

import ytdl = require('ytdl-core');
import ytsr = require('ytsr');
import { Bot } from '../../../bot';
import { Command } from '../../../models/modules/command.model';
import { EmbedHelper } from '../../../utils/embed.helper';
import { ISong } from '../models/song.interface';
import { MusicModule } from '../music.module';
import { Logger } from '../../../logger/logger';
import { IServerMusicQueue } from '../models/server-music-queue.interface';

export default class PlayCommand extends Command {
  name = 'play';
  visible = true;
  description = 'Add a song from url to the queue';
  permissions = [ CommandPermission.EVERYONE ];

  slashCommand = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description)
    .addStringOption((option) =>
      option
        .setName('song')
        .setDescription('The name of the song to play or URL')
        .setRequired(true)
    ).setDefaultPermission(true);
  
  execution = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply();
    interaction.member = interaction.member as GuildMember;
    const song = interaction.options.getString('song');
    
    const playEmbed = await this.play(
      interaction.channel as TextChannel,
      interaction.member.voice.channel as VoiceChannel,
      interaction.guild,
      interaction.member,
      song
    );

    interaction.editReply({ embeds: [playEmbed] });
  };

  private get musicModule(): MusicModule {
    return this.module as MusicModule;
  }

  /**
   * Check if the user can play a song based off permissions.
   * If they can't then notify the channel of why, else load the song from
   * youtube and play it or add it to the queue
   *
   * @param textChannel the text channel which triggered the command
   * @param voiceChannel the voice channel of the member who triggered the command
   * @param guild the server to play music in
   * @param member the server member who triggered the command
   * @param arg command argument containing either song name or an url
   */
  private async play(
    textChannel: TextChannel,
    voiceChannel: VoiceChannel,
    guild: Guild,
    member: GuildMember,
    arg: string
  ): Promise<MessageEmbed> {
    // Check if they are in a voice channel
    if (!voiceChannel) {
      return EmbedHelper.createColouredEmbed('BLUE', 'You need to be in a voice channel to play music!');
    }

    // Check if the bot has permissions to play music in that server
    const issue = this.hasPermissions(voiceChannel);
    if (issue !== null) {
      return EmbedHelper.createColouredEmbed('YELLOW', issue);
    }

    // Get the song info
    let songInfo: ytdl.videoInfo = null;
    try {
      songInfo = await this.getSongInfo(arg);
    } catch (error) {
      return EmbedHelper.createColouredEmbed('RED', error);
    }
    if (songInfo === null) {
      return EmbedHelper.createColouredEmbed('BLUE', 'Could not find the song');
    }

    // Create the song object
    const duration = parseInt(songInfo.videoDetails.lengthSeconds);
    const song: ISong = {
      info: songInfo,
      title: songInfo.videoDetails.title,
      url: songInfo.videoDetails.video_url,
      duration: duration,
      formattedDuration: this.musicModule.formatDuration(duration),
      member: member,
    };

    // Add the new song to the queue
    const serverQueue = this.addSongToQueue(
      song,
      guild,
      voiceChannel,
      textChannel
    );

    if (!serverQueue.isPlaying) {
      // If a new queue was created then we immediately play the song
      this.playSong(guild.id, this.musicModule.musicQueue);
    }

    return EmbedHelper.createColouredEmbed('BLUE', `Queued ${this.musicModule.getFormattedLink(song)} (${song.formattedDuration})`);
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
   * Given the song, create an audio player for the song, or throw an
   * error if it does not start playing in 5 seconds
   *
   * @param song the song to play
   * @returns a promise to the created audio player
   */
  private async getSongPlayer(song: ISong): Promise<AudioPlayer> {

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
      adapterCreator: channel.guild.voiceAdapterCreator,
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
      throw error;
    }
  }

  /**
   * Add the song info to the server's music queue. If there is no queue, a new
   * one is made.
   *
   * @param song the song to add to the queue
   * @param message the message that triggered this command
   * @returns the server's music queue
   */
  private addSongToQueue(song: ISong, guild: Guild, voiceChannel: VoiceChannel, textChannel: TextChannel): IServerMusicQueue {
    let musicQueue: IServerMusicQueue = this.musicModule.musicQueue.get(guild.id);
    if (musicQueue === undefined) {
      musicQueue = {
        voiceChannel: voiceChannel,
        textChannel: textChannel as TextChannel,
        songs: [],
        audioPlayer: null,
        playingMessage: null,
        isPlaying: false,
        isRepeating: false,
      };
      this.musicModule.musicQueue.set(guild.id, musicQueue);
    }

    musicQueue.songs.push(song);
    return musicQueue;
  }

  /**
   * Plays the next song in the queue. Once the song ends, pop it from the
   * queue and recursively call this function
   *
   * @param guildId the id of the server the bot is playing music in
   * @param musicQueue a map from a server's id to it's music queue
   * @returns a message saying which song it is currently playing
   */
  private async playSong(
    guildId: string,
    musicQueue: Map<string, IServerMusicQueue>
  ): Promise<void> {

    const serverQueue = musicQueue.get(guildId);
    if (!serverQueue) {
      return;
    }

    // Base case
    if (serverQueue.songs.length === 0) {
      return this.handleEmptyQueue(
        guildId,
        musicQueue,
        serverQueue,
        MusicModule.STANDBY_DURATION
      );
    }

    const connection = await this.connectToChannel(serverQueue.voiceChannel);
    serverQueue.audioPlayer = await this.getSongPlayer(serverQueue.songs[0]);
    connection.subscribe(serverQueue.audioPlayer);
    serverQueue.isPlaying = true;

    serverQueue.audioPlayer.on(AudioPlayerStatus.Idle, () => {
      serverQueue.isPlaying = false;
      this.handleSongFinish(guildId, musicQueue, serverQueue);
    });

    // Send to channel which song we are playing
    this.sendPlayingEmbed(serverQueue);
  }

  /**
   * Handles what to do when the the current song finishes. If the server has
   * repeat active, then add the new song. If the queue is not empty, plays the
   * next song.
   *
   * @param guildId the id of the relevant server
   * @param musicQueue the mapping of server ids to their music queue
   * @param serverQueue the relevant server's music queue
   */
  handleSongFinish(guildId: string, musicQueue: Map<string, IServerMusicQueue>, serverQueue: IServerMusicQueue): void {
    if (serverQueue !== null) {
      const song = serverQueue.songs[0];
      if (serverQueue.isRepeating) {
        serverQueue.songs.push(song);
      }
      serverQueue.songs.shift();
      this.playSong(guildId, musicQueue);
    }
  }

  /**
   * Handles what to do when the queue is empty. If there are no more members,
   * then leave immediate, else wait for a specified duration, and then leave.
   *
   * @param guildId the id of the relevant server
   * @param musicQueue the mapping of server ids to their music queue
   * @param serverQueue the relevant server's music queue
   * @param timeoutDuration how long to stay in the voice channel before leaving
   */
  handleEmptyQueue(
    guildId: string,
    musicQueue: Map<string, IServerMusicQueue>,
    serverQueue: IServerMusicQueue,
    timeoutDuration: number
  ): void {
    const connection = getVoiceConnection(guildId);
    if (serverQueue.voiceChannel.members.size === 0) {
      // If there are no more members
      connection.destroy();
      musicQueue.delete(guildId);
      EmbedHelper.createAndSendEmbed(serverQueue.textChannel, 'Stopping music as all members have left the voice channel');
      return;
    }
    // Wait for 1 minute and if there is no new songs, leave
    setTimeout(() => {
      if (serverQueue.songs.length === 0) {
        connection.destroy();
        musicQueue.delete(guildId);
        return;
      }
    }, timeoutDuration);
  }

  /**
   * Sends a message about the current playing song. If the bot had sent a
   * message like this for the previous song it played, delete that message
   *
   * @param serverQueue the queue for the relevant server
   */
  sendPlayingEmbed(serverQueue: IServerMusicQueue): void {
    const song = serverQueue.songs[0];
    const songLink = this.musicModule.getFormattedLink(song);
    EmbedHelper.createAndSendEmbed(serverQueue.textChannel, `Now playing ${songLink} (${song.formattedDuration}) [${song.member}]`)
    .then((message) => {
      if (serverQueue.playingMessage !== null) {
        serverQueue.playingMessage.delete();
      }
      serverQueue.playingMessage = message;
    });
    return;
  }

  /**
   * Check if the bot has permissions to join the voice channel.
   *
   * @param voiceChannel the voice channel to join
   * @returns a string with the issue preventing the bot from connecting, else
   *          null if there are no issues
   */
  private hasPermissions(voiceChannel: VoiceChannel | StageChannel): string {
    const permissions = voiceChannel.permissionsFor(Bot.getClient().user);
    if (!permissions.has('CONNECT')) {
      return 'I need the permissions to join your voice channel!';
    } else if (!permissions.has('SPEAK')) {
      return 'I need the permissions to speak in your voice channel!';
    }
    return null;
  }
}
