import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, Guild, GuildMember, Message, MessageEmbed, StageChannel, VoiceChannel } from 'discord.js';
import { Bot } from '../../../bot';
import { Command } from '../../../models/modules/command.model';
import { EmbedHelper } from '../../../utils/embed.helper';
import { GuildMusic } from '../models/guild-music.model';
import { Song } from '../models/song.model';
import { MusicModule } from '../music.module';
import { CommandPermission } from './../../../models/modules/command-permission.enum';

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
    
    this.play(
      interaction.member.voice.channel as VoiceChannel,
      interaction.guild,
      interaction.member,
      song
    ).then((guildMusic: GuildMusic) => {

      guildMusic.statusMessage.delete();
      const payload = guildMusic.statusMessage.composeStatusMessage();

      interaction.editReply(payload).then((message: Message) => {
        guildMusic.statusMessage.setMessage(message);
      });
    }, (errorMessageEmbed: MessageEmbed) => {
      interaction.editReply({ embeds: [errorMessageEmbed] });
      setTimeout(() => { interaction.deleteReply(); }, 10000);
    });
  };

  private get musicModule(): MusicModule {
    return this.module as MusicModule;
  }

  /**
   * Check if the user can play a song based off permissions.
   * If they can't then notify the channel of why, else load the song and play it or add it to the queue
   *
   * @param textChannel the text channel which triggered the command
   * @param voiceChannel the voice channel of the member who triggered the command
   * @param guild the server to play music in
   * @param member the server member who triggered the command
   * @param arg command argument containing either song name or an url
   * 
   * @returns the server queue in which the song has been added,
   * or reject the promise with an embed message to send
   */
  private async play(
    voiceChannel: VoiceChannel,
    guild: Guild,
    member: GuildMember,
    arg: string
  ): Promise<GuildMusic> {

    // Check if they are in a voice channel
    if (!voiceChannel) {
      return Promise.reject(EmbedHelper.createColouredEmbed('BLUE', 'You need to be in a voice channel to play music!'));
    }

    // Check if the bot has permissions to play music in that server
    const issue = this.hasPermissions(voiceChannel);
    if (issue !== null) {
      return Promise.reject(EmbedHelper.createColouredEmbed('YELLOW', issue));
    }

    // Get the song info
    let song: Song = null;
    try {
      song = await Song.initSong(arg, member);
      if(!song) {
        return Promise.reject(EmbedHelper.createColouredEmbed('BLUE', 'Could not find the song'));
      }
    } catch (error) {
      return Promise.reject(EmbedHelper.createColouredEmbed('RED', error.toString()));
    }

    // Add the new song to the queue and play it
    const guildMusic = this.addSongToQueue(song, guild, voiceChannel);
    guildMusic.play();

    return guildMusic;
  }

  /**
   * Add the song info to the server's music queue. If there is no queue, a new
   * one is made.
   *
   * @param song the song to add to the queue
   * @param message the message that triggered this command
   * @returns the server's music queue
   */
  private addSongToQueue(song: Song, guild: Guild, voiceChannel: VoiceChannel): GuildMusic {
    let guildMusic: GuildMusic = this.musicModule.guildMusicMap.get(guild.id);
    if (guildMusic === undefined) {
      guildMusic = new GuildMusic(guild, voiceChannel);
      this.musicModule.guildMusicMap.set(guild.id, guildMusic);
    }

    guildMusic.musicQueue.pushSong(song);
    return guildMusic;
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
