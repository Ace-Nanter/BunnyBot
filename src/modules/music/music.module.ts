import { getVoiceConnection } from '@discordjs/voice';
import { ButtonInteraction, VoiceState } from 'discord.js/typings/index.js';
import { Bot } from '../../bot';
import { BotModule } from '../../models/modules/bot-module.model';
import { default as PlayCommandClass } from './commands/play.command';
import { GuildMusic } from './models/guild-music.model';

export class MusicModule extends BotModule {

  public static readonly STANDBY_DURATION = 60000;

  guildMusicMap: Map<string, GuildMusic>;

  constructor(params: any) {
    super();

    this.callbacks = new Map();

    this.commands = [];
    this.commands.push(new PlayCommandClass(this));

    this.guildMusicMap = new Map();
    this.callbacks.set('voiceStateUpdate', (oldState: VoiceState, newState: VoiceState) => { this.onVoiceChannelUpdate(oldState, newState); });

    this.initButtons();
  }

  private initButtons() {
    const bot: Bot = Bot.getInstance();
    bot.setButton('music-rewind', (interaction) => { this.onRewindButton(interaction); });
    bot.setButton('music-fast-forward', (interaction) => { this.onFastForwardButton(interaction); });
    bot.setButton('music-pause', (interaction) => { this.onPauseButton(interaction); });
    bot.setButton('music-play', (interaction) => { this.onPlayButton(interaction); });
    bot.setButton('music-stop', (interaction) => { this.onStopButton(interaction); });
  }

  /**
   * When someone joins or leave voice channel, see if bot should leave voice channel
   */
  private onVoiceChannelUpdate(oldState: VoiceState, newState: VoiceState): void {

    if(oldState.guild.id !== newState.guild.id) return;

    const guildId = oldState.guild.id;
    const guildMusic = this.guildMusicMap.get(guildId);

    if(!guildMusic) return;

    const connection = getVoiceConnection(guildId);
    if(connection) {
      if (guildMusic.voiceChannel.members.size <= 1) { 
        // If there are no more members
        guildMusic.disconnect();
        this.guildMusicMap.delete(guildId);
      }
    } else {
      this.guildMusicMap.delete(guildId);
    }
  }

  private onRewindButton(interaction: ButtonInteraction): void {
    interaction.deferUpdate();
    const guildMusic = this.getGuildMusic(interaction);
    guildMusic.rewind();
  }

  private onFastForwardButton(interaction: ButtonInteraction): void {
    interaction.deferUpdate();
    const guildMusic = this.getGuildMusic(interaction);
    guildMusic.fastForward();
  }

  private onPauseButton(interaction: ButtonInteraction): void {
    interaction.deferUpdate();
    const guildMusic = this.getGuildMusic(interaction);
    guildMusic.pause();
  }

  private onPlayButton(interaction: ButtonInteraction): void {
    interaction.deferUpdate();
    const serverQueue = this.getGuildMusic(interaction);
    serverQueue.unpause();
  }

  private onStopButton(interaction: ButtonInteraction): void {
    interaction.deferUpdate();
    const serverQueue = this.getGuildMusic(interaction);
    serverQueue.disconnect();
    this.guildMusicMap.delete(interaction.guild.id);
  }

  private getGuildMusic(interaction: ButtonInteraction): GuildMusic {
    if(!this.guildMusicMap || this.guildMusicMap.size === 0) return;

    return this.guildMusicMap.get(interaction.guild.id);
  }
}