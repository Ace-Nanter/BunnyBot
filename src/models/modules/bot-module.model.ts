import { SlashCommandBuilder } from '@discordjs/builders';
import { ClientEvents } from 'discord.js';
import { Command } from './command.model';

export abstract class BotModule {

  constructor(params: any) { }

  protected callbacks: Map<keyof ClientEvents, ((...args: ClientEvents[keyof ClientEvents]) => void)>;
  protected commands: Map<string, Command>;

  getEventsCovered(): (keyof ClientEvents)[] {
    return this.callbacks && this.callbacks.size > 0 ?
      Array.from(this.callbacks.keys()) : null;
  }

  getCallback(eventType: (keyof ClientEvents)): ((...args: ClientEvents[keyof ClientEvents]) => void) {
    return this.callbacks.get(eventType);
  }

  getCommands(): Map<string, Command> {
    return this.commands;
  }
}