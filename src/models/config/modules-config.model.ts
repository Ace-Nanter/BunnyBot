import { inherits } from "util";

export class ModulesConfig extends Config {

    private modulesNames: string[];

    public getModulesNames() : string[] {
        return this.modulesNames;
    }
}