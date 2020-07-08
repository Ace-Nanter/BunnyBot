import { TextChannel, MessageEmbed } from "discord.js";
import { DiscordLogger } from "./discord-logger";

export class Logger {

    private static instance: LoggerInterface = null;

    private constructor() { }

    public static setLoggerType(type: LoggerType, ...args: any[]) {
        switch(type) {
            case LoggerType.DiscordLogger: 
                if(args && args.length === 1 && args[0]) {
                    Logger.instance = new DiscordLogger(args[0]);
                }
                else {
                    console.error('Not enough argument for instanciating a DiscordLogger!');
                }
            break;
        }
    }

    public static log(msg: string) {
        if(Logger.instance) {
            Logger.instance.log(msg);
        }
        else {
            console.log(msg);
        }
    }

    public static info(msg: string) {
        if(Logger.instance) {
            Logger.instance.info(msg);
        }
        else {
            console.info(msg);
        }
    }

    public static error(msg: string) {
        if(Logger.instance) {
            Logger.instance.warn(msg);
        }
        else {
            console.warn(msg);
        }
    }

    public static warn(msg: string) {
        if(Logger.instance) {
            Logger.instance.warn(msg);
        }
        else {
            console.warn(msg);
        }
    }
}
