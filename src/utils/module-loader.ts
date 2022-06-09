import { Logger } from '../logger/logger';
import { BotModule } from '../models/bot-module.model';
import { IModuleConfig } from '../models/module-config.model';
import * as ModuleIndex from '../modules/index';

export class ModuleLoader {

  public static async loadModule(config: IModuleConfig): Promise<BotModule> {
    if (config && config.enabled) {
      try {
        let module: BotModule = new (<any>ModuleIndex)[config.moduleName](config.guildId);

        if (module == null || module == undefined) {
          module = null;
          Logger.error(`Unable to load module ${config.moduleName}`);
          return Promise.reject();
        }

        await module.init(config.params);

        return Promise.resolve(module);
      }
      catch (error) {
        Logger.warn(`Module ${config.moduleName} not found! Error: ${error}`);
        return Promise.reject();
      }
    }
  }
}