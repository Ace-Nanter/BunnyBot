import { BotModule } from '../../models/bot-module.model';
import { default as MinecraftCommandClass } from './commands/minecraft.command';
import { MinecraftInterfaceClient } from './minecraft-interface.client';

export class MinecraftModule extends BotModule {

  public client: MinecraftInterfaceClient;
  
  protected initCallbacks(): void {
    this.callbacks = new Map();
  }

  protected initCommands(): void {
    this.commands.push(new MinecraftCommandClass(this));
  }

  protected async initModule(params?: any[]): Promise<void> {
    this.client = new MinecraftInterfaceClient(params['serverUrl']);
  }
}