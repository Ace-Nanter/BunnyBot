import DiscordLogger from './discord-logger';
import LoggerType from './logger-type';

export interface ILogger {
  log(msg: string): void;

  info(msg: string): void;

  error(msg: string): void;

  warn(msg: string): void;
}

export class Logger {
  private static instance: ILogger | undefined;

  public static setLoggerType(type: LoggerType, ...args: any[]): void {
    switch (type) {
      case LoggerType.DiscordLogger:
        if (args && args.length === 1 && args[0]) {
          Logger.instance = new DiscordLogger(args[0]);
        } else {
          console.error('Not enough argument to create a DiscordLogger!');
        }
        break;
      default:
        break;
    }
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
