import { getVoiceConnection } from '@discordjs/voice';
import { ButtonInteraction, Interaction, SelectMenuInteraction, VoiceState } from 'discord.js';
import { BotModule } from '../../models/modules/bot-module.model';
import { default as MusicCommandClass } from './commands/music.command';
import { GuildMusic } from './models/guild-music.model';

export class MusicModule extends BotModule {

  public static readonly STANDBY_DURATION = 60000;

  guildMusicMap: Map<string, GuildMusic>;

  constructor() {
    super();

    this.callbacks = new Map();

    this.commands = [];
    this.commands.push(new MusicCommandClass(this));

    this.guildMusicMap = new Map();
    this.callbacks.set('voiceStateUpdate', (oldState: VoiceState, newState: VoiceState) => { this.onVoiceChannelUpdate(oldState, newState); });
    this.callbacks.set('voiceStateUpdate', (oldState: VoiceState, newState: VoiceState) => { this.onVoiceChannelUpdate(oldState, newState); });
    this.callbacks.set('interaction', async (interaction: Interaction) => { this.onInteraction(interaction); })
  }

  private async onInteraction(interaction: Interaction) {
    if (interaction.isButton()) {
      switch (interaction.customId) {
        case 'music-rewind':
          this.onRewindButton(interaction);
          break;
        case 'music-fast-forward':
          this.onFastForwardButton(interaction);
          break;
        case 'music-pause':
          this.onPauseButton(interaction);
          break;
        case 'music-play':
          this.onPlayButton(interaction);
          break;
        case 'music-stop':
          this.onStopButton(interaction);
          break;
        case 'music-delete':
          this.onDeleteButton(interaction);
          break;
      }
    }
    else if (interaction.isSelectMenu() && interaction.customId === 'music-delete-menu') {
      this.onDeleteMenu(interaction);
      console.log(interaction);
      // TODO : to complete
    }
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

  private onDeleteButton(interaction: ButtonInteraction): void {
    interaction.deferUpdate();
    const serverQueue = this.getGuildMusic(interaction);
    serverQueue.displayDeleteMenu();
  }

  private onDeleteMenu(interaction: SelectMenuInteraction): void {
    interaction.deferUpdate();
    const serverQueue = this.getGuildMusic(interaction);
    serverQueue.removeFromQueue(interaction.values);
  }

  private getGuildMusic(interaction: ButtonInteraction | SelectMenuInteraction): GuildMusic {
    if(!this.guildMusicMap || this.guildMusicMap.size === 0) return;

    return this.guildMusicMap.get(interaction.guild.id);
  }
}