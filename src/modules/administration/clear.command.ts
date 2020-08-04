import { CommandContext } from "../../models/command/command-context.model";
import { Message, DMChannel, TextChannel } from "discord.js";

export function clear(commandContext: CommandContext) {
    if(commandContext.args && commandContext.args.length === 1 && commandContext.message) {
        const nb = parseInt(commandContext.args[0]); 
        if(nb && nb > 0 && commandContext.message.channel instanceof TextChannel) {
            const channel: TextChannel = commandContext.message.channel as TextChannel;
            channel.bulkDelete(nb + 1);
        }
    }
}