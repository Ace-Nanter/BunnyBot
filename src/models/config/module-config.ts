export class ModulesListConfig extends Config {
    moduleList: ModuleConfig[]
}

export class ModuleConfig {
    moduleName: string;
    params: any;
}