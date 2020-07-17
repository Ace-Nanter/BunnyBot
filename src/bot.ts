import * as Discord from 'discord.js';
import { Dao } from './dao/dao';
import { Logger } from './logger/logger';
import { ModulesListConfig } from './models/config/module-config';
import { ModuleLoader } from './modules/module-loader';

export class Bot {

    private static Instance : Bot;
    private client: Discord.Client;

    

    public static getInstance() {
        if(!Bot.Instance) {
            Bot.Instance = new Bot();
        }

        return Bot.Instance;
    }

    public static getClient() {
        return Bot.getInstance().client;
    }

    public static start() {
        return Bot.getInstance().start();
    }

    private constructor() {
        this.client = new Discord.Client;
    }

    private async start() {

        const self = this;

        this.client.login(process.env.TOKEN);
        this.client.on('ready', function() {

            // Launch Logger
            self.initLogger().then(() => {
                Dao.getInstance().getModulesConfigs().then(moduleListConfigs => {

                    if(moduleListConfigs && moduleListConfigs.moduleList.length > 0) {
                        self.loadModules(moduleListConfigs);
                    }
                    else {
                        console.error('Error with modules configuration!');
                    }
                    
                    Logger.info("Bot started successfully");
                });
            }).catch(error => Logger.error(error));
        });
    
        /*
        this.client.on('messageReactionAdd', function(messageReaction: Discord.MessageReaction, user: Discord.User) {
            if(messageReaction.message.id === '730433338279723098') {
                console.log("C'est le bon!");
            }
            console.log(messageReaction.emoji.identifier);
            console.log(user);
        });

        this.client.on('messageReactionRemove', function(messageReaction: Discord.MessageReaction, user: Discord.User) {
            
        });*/

        this.client.on('disconnect', function() {
            Logger.warn("Disconnecting...");
            this.dao.closeConnection();
        });
    }

    private async initLogger() {
        if(process.env.LOG_CHANNEL_ID) {
            const channel = await this.client.channels.fetch(process.env.LOG_CHANNEL_ID);
            if(channel && channel.type === 'text') {
                Logger.setLoggerType(LoggerType.DiscordLogger, channel);
            }
        }
    }

    private loadModules(modulesConfig: ModulesListConfig) {
        modulesConfig.moduleList.forEach(moduleConfig => {
            var module = ModuleLoader.loadModule(moduleConfig);
            if(module && module.getEventsCovered()) {
                module.getEventsCovered().forEach(eventType => {
                    this.client.on(eventType, module.getCallback(eventType));
                });
            }
            
            Logger.info(moduleConfig.moduleName);
        });
    }
}