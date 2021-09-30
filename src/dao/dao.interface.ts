import { ModuleConfig } from "../models/modules/module-config";
import { Game } from "../models/game.model";

export interface DaoInterface {

    getModulesConfigs() : Promise<ModuleConfig[]>;

    getGameList() : Promise<Game[]>;
}