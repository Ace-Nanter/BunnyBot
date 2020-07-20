import { ModulesListConfig } from "../models/config/module-config";
import { Game } from "../models/game.model";

export interface DaoInterface {

    getModulesConfigs() : Promise<ModulesListConfig>;

    getGameList() : Promise<Game[]>;
}