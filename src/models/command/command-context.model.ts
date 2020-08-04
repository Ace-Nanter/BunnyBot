import { Message } from "discord.js";

export class CommandContext {
    name: string;
    args: string[];
    message: Message;

    constructor(name: string, args: string[], message: Message) {
        this.name = name;
        this.args = args;
        this.message = message;
    }
}