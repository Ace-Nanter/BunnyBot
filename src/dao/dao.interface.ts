import { ModulesListConfig } from "../models/config/module-config";

export interface DaoInterface {

    getModulesConfigs() : Promise<ModulesListConfig>;
}