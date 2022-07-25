import { Channel, Colors, EmbedBuilder, TextChannel } from 'discord.js';

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
    const builder = new EmbedBuilder()
      .setColor(Colors.White)
      .setDescription(msg)
      .setTitle('Log');
    this.channel.send({ embeds: [builder] });
  }

  public info(msg: string): void {
    console.info(msg);
    const builder = new EmbedBuilder()
      .setColor(Colors.Blue)
      .setDescription(msg)
      .setTitle('Info');
    this.channel.send({ embeds: [builder] });
  }

  public error(msg: string): void {
    console.error(msg);
    const builder = new EmbedBuilder()
      .setColor(Colors.Red)
      .setDescription(msg)
      .setTitle('Error');
    this.channel.send({ embeds: [builder] });
  }

  public warn(msg: string): void {
    console.warn(msg);
    const builder = new EmbedBuilder()
      .setColor(Colors.Orange)
      .setDescription(msg)
      .setTitle('Warn');
    this.channel.send({ embeds: [builder] });
  }
}
