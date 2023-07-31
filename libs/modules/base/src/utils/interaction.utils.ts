import { CommandInteraction } from 'discord.js';

const TIMESPAN_BEFORE_DELETE = 10000;

// eslint-disable-next-line import/prefer-default-export
export async function replyAndDelete(interaction: CommandInteraction, msg: string) {
  const promise = interaction.replied
    ? interaction.editReply({
        content: msg,
      })
    : interaction.reply({ content: msg });

  return promise.then(() => {
    setTimeout(() => {
      interaction.deleteReply();
    }, TIMESPAN_BEFORE_DELETE);
  });
}
