import { ModuleConfig } from "../models/config/module-config";
import { Game } from "../models/game.model";

export interface DaoInterface {

    getModulesConfigs() : Promise<ModuleConfig[]>;

    getGameList() : Promise<Game[]>;
}