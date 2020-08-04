import { GuildMember } from "discord.js";
import { Bot } from "../../bot";
import { Logger } from "../../logger/logger";
import { BotModule } from "../common/bot-module";
import { clear } from "./clear.command";
import { setActivity } from "./set-activity.command";
import { Command } from "../../models/command/command.model";
import { Permission } from "../../models/command/permission.enum";

export class AdministrationModule extends BotModule {

    private static newRoleId: string;

    constructor(params : any) {
        super(params);

        if(params && params['newRole']) {
            AdministrationModule.newRoleId = params['newRole'];
        }

        this.callbacks = new Map();
        this.callbacks.set('guildMemberAdd', AdministrationModule.onGuildMemberAdd);

        this.commands = new Map();
        this.commands.set('clear', new Command('clear', Permission.OWNER, clear));
        this.commands.set('set-activity', new Command('set-activity', Permission.OWNER, setActivity));
    }

    private static onGuildMemberAdd(member: GuildMember) {
        if(member.user.id !== Bot.getClient().user.id) {
            Logger.info(`${member.user.username} joined ${member.guild.name}!`);
            member.guild.roles.fetch(AdministrationModule.newRoleId).then(role => {
                member.roles.add(role);
            }).catch(e => {
                Logger.warn(`Unable to find newComer role: ${e}`);
            });
        }
    }   
}