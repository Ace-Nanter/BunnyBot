import { GuildMember } from "discord.js";
import { Bot } from "../../bot";
import { Logger } from "../../logger/logger";
import { BotModule } from "../common/bot-module";
import { clear } from "./clear.command";
import { setActivity } from "./set-activity.command";
import { Command } from "../../models/command/command.model";
import { Permission } from "../../models/command/permission.enum";

export class AdministrationModule extends BotModule {

    constructor(params : any) {
        super(params);

        this.callbacks = new Map();
        
        this.commands = new Map();
        this.commands.set('clear', new Command('clear', Permission.OWNER, clear));
        this.commands.set('set-activity', new Command('set-activity', Permission.OWNER, setActivity));
    }
}