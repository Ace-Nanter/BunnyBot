import { EmbedBuilder, RGBTuple } from '@discordjs/builders';
import { Colors, Message, TextBasedChannel } from 'discord.js';

export class EmbedHelper {

  /**
   * @param color the color to use for the embed
   * @param description (optional) the description for the embed
   * @returns a new MessageEmbed with the given color
   */
  public static createColouredEmbed(color: number, description?: string): EmbedBuilder {
    const embed = new EmbedBuilder().setColor(color);

    if(description) {
      embed.setDescription(description);
    }

    return embed;
  }

  /**
   * Creates a new embed with that message and sends it to the channel, and stop typing in the channel
   *
   * @param channel the channel to send the message in
   * @param message the message to send
   * @returns a promise for the sent message
   */
   public static createAndSendEmbed(channel: TextBasedChannel, description?: string): Promise<Message> {
    return channel.send({ embeds: [EmbedHelper.createColouredEmbed(Colors.Blue, description)] });
  }
}