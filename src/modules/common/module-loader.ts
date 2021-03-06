import { ModuleConfig } from "../../models/config/module-config";
import { BotModule } from "./bot-module";
import { Logger } from "../../logger/logger";
import * as ModuleIndex from "./index";

export class ModuleLoader {

    public static loadModule(config: ModuleConfig) : BotModule {
        if(config && config.enabled) {
            try {
                let module : BotModule = new (<any>ModuleIndex)[config.moduleName](config.params);
    
                if(module == null || module == undefined) {
                    module = null;
                    Logger.error(`Unable to load module ${config.moduleName}`);
                }
                
                return module;
            }
            catch(error) {
                Logger.warn(`Module ${config.moduleName} not found! Error: ${error}`);
                return null;
            }
        }
    }
}