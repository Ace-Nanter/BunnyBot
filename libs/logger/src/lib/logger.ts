import { TextChannel } from 'discord.js';
import DiscordLogger from './discord-logger';

export interface ILogger {
  log(msg: string): void;

  info(msg: string): void;

  error(msg: string): void;

  warn(msg: string): void;
}

export class Logger {
  private static instance: ILogger | undefined;

  public static initDiscordLogger(textChannel: TextChannel): void {
    Logger.instance = new DiscordLogger(textChannel);
  }

  public static log(msg: string): void {
    console.log(msg);
    if (Logger.instance) {
      Logger.instance.log(msg);
    }
  }

  public static info(msg: string): void {
    console.info(msg);
    if (Logger.instance) {
      Logger.instance.info(msg);
    }
  }

  public static error(msg: string): void {
    console.error(msg);
    if (Logger.instance) {
      Logger.instance.error(msg);
    }
  }

  public static warn(msg: string): void {
    console.warn(msg);
    if (Logger.instance) {
      Logger.instance.warn(msg);
    }
  }
}

export default Logger;
