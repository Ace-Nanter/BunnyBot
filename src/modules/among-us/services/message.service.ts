import { Message, TextChannel } from "discord.js";

export class MessageService {

  private static readonly emojiMap: Map<number, string> = new Map([
    [1, '0⃣'],
    [2, '1⃣'],
    [3, '2⃣'],
    [4, '3⃣'],
    [5, '4⃣'],
    [6, '5⃣'],
    [7, '7⃣'],
    [8, '8⃣'],
    [9, '9⃣'],
    [10, '🔟']
  ]);

  public static createMessage(textChannel: TextChannel) {

    let content: string = '';

    const params = {
      'title': 'Merci de cocher la réaction correspondant à votre pseudo!',
      'description': content
    }

    textChannel.send("Test").then((message: Message) => {
      // Put reaction
    });
  }
}