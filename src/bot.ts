import * as Discord from 'discord.js';
import { Logger } from './logger/logger';
import { domain } from 'process';
import { Dao } from './dao/dao';
import { ModulesConfig } from './models/config/modules-config.model';

export class Bot {

    private client: Discord.Client;

    constructor() {
        this.client = new Discord.Client;
    }

    public async start() {

        const self = this;

        this.client.login(process.env.TOKEN);
        this.client.on('ready', function() {

            // Launch Logger
            self.initLogger().then(() => {
                self.getConfigs().then(configs => {
                    
                    console.log(configs);

                    //self.loadModules(configs[0]);

                    Logger.info("Bot started successfully");
                });
            });
        });
    
        this.client.on('messageReactionAdd', function(messageReaction: Discord.MessageReaction, user: Discord.User) {
            if(messageReaction.message.id === '730433338279723098') {
                console.log("C'est le bon!");
            }
            console.log(messageReaction.emoji.identifier);
            console.log(user);
        });

        this.client.on('messageReactionRemove', function(messageReaction: Discord.MessageReaction, user: Discord.User) {
            
        });

        this.client.on('disconnect', function() {
            Logger.warn("Disconnecting...");
            this.dao.closeConnection();
        })
    }

    private async initLogger() {
        if(process.env.LOG_CHANNEL_ID) {
            const channel = await this.client.channels.fetch(process.env.LOG_CHANNEL_ID);
            if(channel && channel.type === 'text') {
                Logger.setLoggerType(LoggerType.DiscordLogger, channel);
            }
        }
    }

    private getConfigs() : Promise<Config[]> {
        return Dao.getInstance().getConfigs();
    }

    private loadModules(modulesConfig: ModulesConfig) {
        modulesConfig.getModulesNames().forEach(name => {
            Logger.info(name);
        });
    }
}