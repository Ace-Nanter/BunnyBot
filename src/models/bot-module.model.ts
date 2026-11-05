import { ClientEvents, Snowflake } from 'discord.js';
import { Bot } from '../bot';
import { Command } from './command.model';

export abstract class BotModule {
  
  protected readonly guildId: Snowflake;
  protected callbacks: Map<keyof ClientEvents, ((...args: any[]) => void)>;
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

  getCallbacks(): (keyof ClientEvents)[] {
    return this.callbacks && this.callbacks.size > 0 ?
      Array.from(this.callbacks.keys()) : null;
  }

  getCallback(eventType: (keyof ClientEvents)): ((...args: any[]) => void) {
    return this.callbacks.get(eventType) as (...args: any[]) => void;
  }
}