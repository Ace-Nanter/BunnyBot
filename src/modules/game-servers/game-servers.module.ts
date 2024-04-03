import { BotModule } from '../../models/bot-module.model';
import { default as GameServerCommandClass } from './commands/game-server.command';
import { GameServersInterfaceClient as GameServersInterfaceClient } from './game-servers-interface.client';

export class GameServersModule extends BotModule {

  public client: GameServersInterfaceClient;
  
  protected initCallbacks(): void {
    this.callbacks = new Map();
  }

  protected initCommands(): void {
    this.commands.push(new GameServerCommandClass(this, 'minecraft'));
    this.commands.push(new GameServerCommandClass(this, 'palworld'));
    this.commands.push(new GameServerCommandClass(this, 'ark'));
  }

  protected async initModule(params?: any[]): Promise<void> {
    this.client = new GameServersInterfaceClient(params['serverUrl']);
  }
}