import { Guild, Message, MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu, WebhookEditMessageOptions } from 'discord.js';
import { GuildMusic } from './guild-music.model';

export class MusicStatusMessage {
  private message: Message;

  public constructor(
    private guildMusic: GuildMusic,
    private guild: Guild
  ) { }

  /**
   * Reset status message
   * @param message Discord Message containing server music status
   */
  public setMessage(message: Message): void {
    this.message = message;
  }

  /**
   * Deletes message if it is defined
   */
  public delete(): void {
    if(this.message) {
      this.message.delete();
    }
  }

  /**
   * Refresh status message
   */
  public refresh(deleteMenu?: boolean): void {
    const payload = this.composeStatusMessage(deleteMenu);

    if(this.message) {
      this.message.edit(payload);
    }
  }

  /**
   * Composes status message for the server queue, with the list of the songs and the currently played song
   * @returns a message embed containing every information about server queue state
   */
   public composeStatusMessage(deleteMenu?: boolean): WebhookEditMessageOptions {
    const queue = this.guildMusic.musicQueue;

    const message: MessageEmbed = new MessageEmbed()
      .setColor(this.guildMusic.isPlaying && !this.guildMusic.isPaused ? 'GREEN' : 'RED')
      .setAuthor(this.guild.me.displayName, this.guild.me.displayAvatarURL())
    
    queue.addSongList(message, this.guildMusic.isPlaying);
    message.addField('\u200B', '\u200B');

    if(this.guildMusic.isPlaying) {
      const song = queue.currentSong;
      const thumbnails = song.info.player_response.videoDetails.thumbnail.thumbnails;

      message.addField(
        this.guildMusic.isPaused ? 'Currently paused': 'Now playing',
        `[${song.title}](${song.url})`
      );
      
      message.setImage(thumbnails[thumbnails.length - 1].url);
    }

    const payload = { embeds: [message] };
    const components = [];
    const buttons = this.getMessageButtons();

    if (buttons) {
      components.push(buttons);
    }

    if (buttons && deleteMenu) {
      const menu = this.createDeleteMenu();
      if (menu) {
        components.push(menu);
      }
    }

    if(components !== null && components.length > 0) {
      payload['components'] = components;
    }

    return payload;
  }

  /**
   * Set buttons on the status message
   */
  public getMessageButtons(): MessageActionRow {

    if(!this.guildMusic.isPlaying) return null;

    const queue = this.guildMusic.musicQueue;
    const messageActionRow = new MessageActionRow();

    const deleteButton = new MessageButton()
      .setCustomId('music-delete')
      .setEmoji('🗑')
      .setStyle('SECONDARY')

    const rewindButton = new MessageButton()
      .setCustomId('music-rewind')
      .setEmoji('⏮')
      .setStyle('SECONDARY');

    const playButton =  new MessageButton()
      .setCustomId('music-play')
      .setEmoji('▶')
      .setStyle('SUCCESS');

    const pauseButton = new MessageButton()
    .setCustomId('music-pause')
    .setEmoji('⏸')
    .setStyle('SECONDARY');

    const fastForwardButton = new MessageButton()
      .setCustomId('music-fast-forward')
      .setEmoji('⏭')
      .setStyle('SECONDARY');

    const stopButton = new MessageButton()
      .setCustomId('music-stop')
      .setEmoji('⏹')
      .setStyle('DANGER');

    if(!queue.isEmpty()) {
      messageActionRow.addComponents(deleteButton);
    }

    if(queue.hasPrevious()) {
      messageActionRow.addComponents(rewindButton);
    }

    if(this.guildMusic.isPaused) {
      messageActionRow.addComponents(playButton);
    } else {
      messageActionRow.addComponents(pauseButton);
    }

    messageActionRow.addComponents(stopButton);
    
    if(queue.hasNext()) {
      messageActionRow.addComponents(fastForwardButton);
    }
    
    return messageActionRow;
  }
  
  /**
   * Displays select menu to delete songs from queue
   */
  private createDeleteMenu(): MessageActionRow {
    
    const queue = this.guildMusic.musicQueue;
    const row = new MessageActionRow();
    const selectMenu = new MessageSelectMenu();

    selectMenu.setCustomId('music-delete-menu');
    selectMenu.setPlaceholder('Choose songs to remove from queue');
    
    const options = queue.getDeleteMenuOptions();

    if(options && options.length > 0) {
      selectMenu.addOptions(options);
      selectMenu.setMaxValues(options.length);
      row.addComponents(selectMenu);

      return row;
    }
    
    return null;
  }

  // ⏮⏭⏹▶⏸🔁🔂
}