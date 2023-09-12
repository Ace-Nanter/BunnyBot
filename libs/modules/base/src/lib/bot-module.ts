import { Client, ClientEvents, Snowflake } from 'discord.js';
import { Command } from './command';

type CallbackMap = {
  [K in keyof ClientEvents]?: (...args: ClientEvents[K]) => void;
};

export abstract class BotModule {
  protected readonly client: Client;
  public readonly guildId?: Snowflake;
  protected callbacks: CallbackMap;
  protected commands: Command[];

  constructor(client: Client, guildId?: Snowflake) {
    this.client = client;
    this.guildId = guildId;

    this.callbacks = {};
    this.commands = [];
  }

  public async init(params?: Map<string, string>): Promise<void> {
    this.initCallbacks();
    this.initCommands();

    if (params) {
      await this.initModule(params);
    }
  }

  public getCommands(): Command[] {
    return this.commands;
  }

  protected abstract initCallbacks(): void;
  protected abstract initCommands(): void;
  protected abstract initModule(params?: Map<string, string>): Promise<void>;

  getCallbacks(): (keyof ClientEvents)[] {
    return this.callbacks ? (Object.keys(this.callbacks) as (keyof ClientEvents)[]) : [];
  }

  getCallback<K extends keyof ClientEvents>(eventType: K): ((...args: ClientEvents[K]) => void) | undefined {
    return this.callbacks[eventType];
  }
}

export default BotModule;
