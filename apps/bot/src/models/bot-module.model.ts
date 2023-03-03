import { ClientEvents, Snowflake } from 'discord.js';
import { Bot } from '../bot';
import { Command } from './command.model';

export abstract class BotModule {
  protected readonly guildId: Snowflake;
  protected callbacks: Map<keyof ClientEvents, (...args: ClientEvents[keyof ClientEvents]) => void>;
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

    const bot = Bot.getInstance();

    this.commands.forEach((command: Command) => {
      (this.guildId) ? bot.addGuildCommand(this.guildId, command) : bot.addGlobalCommand(command);
    });

    if (params) {
      await this.initModule(params);
    }
  }

  protected abstract initCallbacks(): void;
  protected abstract initCommands(): void;
  protected abstract initModule(params?: any[]): Promise<void>;

  getCallbacks(): (keyof ClientEvents)[] {
    return this.callbacks && this.callbacks.size > 0 ? Array.from(this.callbacks.keys()) : null;
  }

  getCallback(eventType: keyof ClientEvents): (...args: ClientEvents[keyof ClientEvents]) => void {
    return this.callbacks.get(eventType);
  }
}

export default BotModule;
