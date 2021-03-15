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