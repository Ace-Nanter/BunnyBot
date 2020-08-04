import * as Discord from 'discord.js';
import { Dao } from './dao/dao';
import { Logger } from './logger/logger';
import { ModulesListConfig } from './models/config/module-config';
import { ModuleLoader } from './modules/common/module-loader';
import { Message, MessageMentions } from 'discord.js';
import { CommandContext } from './models/command/command-context.model';
import { Command } from './models/command/command.model';
import { Permission } from './models/command/permission.enum';

export class Bot {

    private static Instance : Bot;
    private client: Discord.Client;
    private commandTable: Map<string, Command>;

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
        this.commandTable = new Map();
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
                    
                    self.client.user.setStatus('online');
                    /*self.client.user.setActivity('Being improved!'/*, 
                    {
                        type: "WATCHING",
                        url: 'https://videos.pierreval.ovh'
                    });*/

                    Logger.info("Bot started successfully");
                });
            }).catch(error => Logger.error(error));
        });

        this.client.on('message', function(message: Message) {
            if(message.mentions.users.has(self.client.user.id)) {
                self.executeCommand(message);
            }
        })

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
            
            // Load module events
            if(module && module.getEventsCovered()) {
                module.getEventsCovered().forEach(eventType => {
                    this.client.on(eventType, module.getCallback(eventType));
                });
            }

            // Load module commands
            if(module && module.getCommands()) {
                module.getCommands().forEach((value, key) => {
                    if(!this.commandTable.has(key)) {
                        this.commandTable.set(key, value);
                    }
                });
            }
        });
    }

    private executeCommand(message: Message) {
        if(message.member.user.id !== this.client.user.id) {
            let tmp = message.content.replace(MessageMentions.USERS_PATTERN, '')
            .split(' ')
            .filter(s => (s && s.trim() !== ''));
            
            const commandName = (tmp.splice(0,1))[0].toLocaleLowerCase();
            const args = tmp;

            // Find command
            const command = this.commandTable.get(commandName);
            if(command) {
                const commandContext = new CommandContext(commandName, args, message);
                if(command.permission === Permission.OWNER && message.member.user.id === process.env.OWNER_ID) {
                    command.fn(commandContext);
                }
                else if(command.permission === Permission.ADMIN && message.member.hasPermission(Discord.Permissions.FLAGS.ADMINISTRATOR)) {
                    command.fn(commandContext);
                }
                else if(command.permission === Permission.ALL) {
                    command.fn(commandContext);
                }
            }
        }
    }
}