import { ClientEvents, Snowflake } from 'discord.js';
import { Bot } from '../bot';
import { Command } from './command.model';

type ClientEventHandler<K extends keyof ClientEvents> = (...args: ClientEvents[K]) => void;

export abstract class BotModule {

  protected readonly guildId: Snowflake;
  protected callbacks: Map<keyof ClientEvents, (...args: never[]) => void>;
  protected commands: Command[];

  constructor(guildId?: Snowflake) {
    this.callbacks = new Map();
    this.commands = [];

    if (guildId) {
      this.guildId = guildId;
    }
  }

  public async init(params?: any[]): Promise<void> {
    this.initCallbacks();
    this.initCommands();

    this.commands.forEach((command: Command) => {
      if (this.guildId) {
        Bot.getInstance().addGuildCommand(this.guildId, command);
      } else {
        Bot.getInstance().addGlobalCommand(command);
      }
    })

    if (params) {
      await this.initModule(params);
    }
  }

  protected abstract initCallbacks(): void;
  protected abstract initCommands(): void;
  protected abstract initModule(params?: any[]): Promise<void>;

  protected setCallback<K extends keyof ClientEvents>(event: K, handler: ClientEventHandler<K>): void {
    this.callbacks.set(event, handler as (...args: never[]) => void);
  }

  getCallbacks(): (keyof ClientEvents)[] {
    return this.callbacks && this.callbacks.size > 0 ?
      Array.from(this.callbacks.keys()) : null;
  }

  getCallback<K extends keyof ClientEvents>(eventType: K): ClientEventHandler<K> {
    return this.callbacks.get(eventType) as ClientEventHandler<K>;
  }
}
