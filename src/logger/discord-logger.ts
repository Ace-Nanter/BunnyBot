import { TextChannel, MessageEmbed, Channel } from 'discord.js';

export class DiscordLogger implements LoggerInterface {

  private channel: TextChannel;

  public constructor(channel: Channel) {
    if (channel && channel instanceof TextChannel) {
      this.channel = channel as TextChannel;
    }
    else {
      console.error('Wrong argument given to DiscordLogger!');
    }
  }

  public log(msg: string): void {
    console.log(msg);
    const messageEmbed = new MessageEmbed()
      .setColor('#FFFFFF')
      .setDescription(msg)
      .setTitle('Log');
    this.channel.send({ embeds: [messageEmbed] });
  }

  public info(msg: string): void {
    console.info(msg);
    const messageEmbed = new MessageEmbed()
      .setColor('#0000FF')
      .setDescription(msg)
      .setTitle('Info');
    this.channel.send({ embeds: [messageEmbed] });
  }

  public error(msg: string): void {
    console.error(msg);
    const messageEmbed = new MessageEmbed()
      .setColor('#FF0000')
      .setDescription(msg)
      .setTitle('Error');
    this.channel.send({ embeds: [messageEmbed] });
  }

  public warn(msg: string): void {
    console.warn(msg);
    const messageEmbed = new MessageEmbed()
      .setColor('#FFFF00')
      .setDescription(msg)
      .setTitle('Warn');
    this.channel.send({ embeds: [messageEmbed] });
  }
}
