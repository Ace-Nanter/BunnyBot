import { BotModule, IModuleConfig } from '@BunnyBot/modules/base';
import { Client } from 'discord.js';
import * as ModuleIndex from './module-index';

export const initModule = async (client: Client, config: IModuleConfig): Promise<BotModule | undefined> => {
  if (!ModuleIndex[config.moduleName]) {
    return Promise.reject(new Error(`Module ${config.moduleName} does not exist`));
  }

  const module: BotModule = new (<unknown>ModuleIndex)[config.moduleName](client, config.guildId);

  if (!module) {
    return Promise.reject(new Error(`Unable to load module ${config.moduleName}`));
  }

  return module
    .init(config.params)
    .then(() => Promise.resolve(module))
    .catch((error) => Promise.reject(error));
};

export default initModule;
