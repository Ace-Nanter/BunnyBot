import { CommandContext as CommandContext } from "../../models/command/command-context.model";
import { Bot } from "../../bot";

export function setActivity(commandContext: CommandContext) {
    if(commandContext.args && commandContext.args.length > 0) {
        const activity = commandContext.args.join(' ');
        Bot.getClient().user.setActivity(activity);    
    }
}