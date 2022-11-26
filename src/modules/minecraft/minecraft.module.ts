import { Guild } from 'discord.js';
import { BotModule } from '../../models/bot-module.model';
import { default as GetOnlinePlayersCommandClass } from './commands/get-online-players.command';
import { default as GetServerStatusCommandClass } from './commands/get-server-status.command';
import { default as StartServerCommandClass } from './commands/start-server.command';
import { default as StopServerCommandsClass } from './commands/stop-server.command';

export class GuildMessagesModule extends BotModule {

  private guild: Guild;
  
  protected initCallbacks(): void {
    this.callbacks = new Map();
  }

  protected initCommands(): void {
    this.commands.push(new StartServerCommandClass(this));
    this.commands.push(new StopServerCommandsClass(this));
    this.commands.push(new GetServerStatusCommandClass(this));
    this.commands.push(new GetOnlinePlayersCommandClass(this));
  }

  protected async initModule(): Promise<void> {
    console.log('Coucou');
  }
}