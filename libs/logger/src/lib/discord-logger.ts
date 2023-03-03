import { EmbedBuilder, TextChannel } from 'discord.js';
import { ILogger } from './logger';

export default class DiscordLogger implements ILogger {
  private channel: TextChannel;

  public constructor(channel: TextChannel) {
    this.channel = channel;
  }

  public log(msg: string): void {
    const messageEmbed = new EmbedBuilder().setColor('#FFFFFF').setDescription(msg).setTitle('Log');
    this.channel.send({ embeds: [messageEmbed] });
  }

  public info(msg: string): void {
    const messageEmbed = new EmbedBuilder().setColor('#0000FF').setDescription(msg).setTitle('Info');
    this.channel.send({ embeds: [messageEmbed] });
  }

  public error(msg: string): void {
    const messageEmbed = new EmbedBuilder().setColor('#FF0000').setDescription(msg).setTitle('Error');
    this.channel.send({ embeds: [messageEmbed] });
  }

  public warn(msg: string): void {
    const messageEmbed = new EmbedBuilder().setColor('#FFFF00').setDescription(msg).setTitle('Warn');
    this.channel.send({ embeds: [messageEmbed] });
  }
}
