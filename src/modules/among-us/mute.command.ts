import { CommandContext as CommandContext } from "../../models/command/command-context.model";
import { Bot } from "../../bot";

export function muteSubscribe(commandContext: CommandContext) {

  // TODO check mentions

  if (commandContext.args && commandContext.args.length > 0) {
    const activity = commandContext.args.join(' ');
    Bot.getClient().user.setActivity(activity);
  }
}

export function muteUnsubscribe(commandContext: CommandContext) {

  // TODO check mentions

  if (commandContext.args && commandContext.args.length > 0) {

  }
}

// export function mute(commandContext: CommandContext) {
//   if(commandContext.args && commandContext.args.length === 1 && commandContext.message) {
//       const nb = parseInt(commandContext.args[0]); 
//       if(nb && nb > 0 && commandContext.message.channel instanceof TextChannel) {
//           const channel: TextChannel = commandContext.message.channel as TextChannel;
//           channel.bulkDelete(nb + 1);
//       }
//   }
// }

// export function unmute(commandContext: CommandContext) {
//   if(commandContext.args && commandContext.args.length === 1 && commandContext.message) {
//     const nb = parseInt(commandContext.args[0]); 
//     if(nb && nb > 0 && commandContext.message.channel instanceof TextChannel) {
//         const channel: TextChannel = commandContext.message.channel as TextChannel;
//         channel.bulkDelete(nb + 1);
//     }
// }
