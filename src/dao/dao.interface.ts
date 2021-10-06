import { ModuleConfig } from "../models/modules/module-config";
import { Game } from "../models/game.model";
import { ActivityOptions } from "discord.js";

export interface DaoInterface {

    getModulesConfigs() : Promise<ModuleConfig[]>;

    getGameList() : Promise<Game[]>;

    saveActivity(activity: string, activityOptions: ActivityOptions): Promise<void>;
}