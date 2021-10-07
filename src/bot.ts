import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { Client, Intents, Snowflake } from 'discord.js';
import { exit } from 'process';
import { Dao } from './dao/dao';
import { Logger } from './logger/logger';
import { LoggerType } from './logger/logger-type';
import { Command } from './models/modules/command.model';
import { ModuleConfig } from './models/modules/module-config';
import { ModuleLoader } from './modules/module-loader';


export class Bot {

  private static Instance: Bot;
  private client: Client;
  private commands: Map<string, Command>;
  private readonly restClient: REST;

  public static getInstance(): Bot {
    if (!Bot.Instance) {
      Bot.Instance = new Bot();
    }

    return Bot.Instance;
  }

  public static getClient(): Client {
    return Bot.getInstance().client;
  }

  public static getId(): Snowflake {
    return Bot.getInstance().client.user.id;
  }

  public static start(): Promise<void> {
    return Bot.getInstance().start();
  }

  private constructor() {
    this.client = new Client({ intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MEMBERS,
      Intents.FLAGS.GUILD_BANS,
      Intents.FLAGS.GUILD_VOICE_STATES,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
      Intents.FLAGS.GUILD_PRESENCES,
      Intents.FLAGS.GUILD_INVITES,
      Intents.FLAGS.DIRECT_MESSAGES,
      Intents.FLAGS.DIRECT_MESSAGE_REACTIONS
    ]});

    this.commands = new Map<string, Command>();
    this.restClient = new REST({ version: '9' }).setToken(process.env.TOKEN);
  }

  private async start(): Promise<void> {

    this.client.login(process.env.TOKEN);

    this.client.once('ready', () => {

      // Launch Logger
      this.initLogger().then(() => {

        // Retrieve modules
        Dao.getInstance().getModulesConfigs().then(moduleConfigList => {

          if (moduleConfigList && moduleConfigList.length > 0) {
            this.loadModules(moduleConfigList);
          }
          else {
            Logger.error('Error with modules configuration!');
          }

          Logger.info("Bot started successfully");
        });


      }).catch((error) => {
        Logger.error(error);
        this.disconnect();
      });
    });

    this.client.on('interactionCreate', async (interaction) => {
      if(!interaction.isCommand()) return ;

      const command: Command = this.commands.get(interaction.commandName);
      if(!command) {
        console.warn(`Error: command ${interaction.commandName} not found!`);
        return ;
      }

      command.execution(interaction);
    })

    this.client.on('disconnect', function () {
      Logger.warn("Disconnecting...");
      this.dao.closeConnection();
    });
  }

  private async initLogger() {
    if (process.env.LOG_CHANNEL_ID) {
      const channel = await this.client.channels.fetch(process.env.LOG_CHANNEL_ID);
      if (channel && channel.type === 'GUILD_TEXT') {
        Logger.setLoggerType(LoggerType.DiscordLogger, channel);
      }
    }
  }

  private loadModules(moduleConfigList: ModuleConfig[]) {
    moduleConfigList.forEach(moduleConfig => {
      const module = ModuleLoader.loadModule(moduleConfig);

      // Load module events
      if (module && module.getEventsCovered()) {
        module.getEventsCovered().forEach(eventType => {
          this.client.on(eventType, module.getCallback(eventType));
        });
      }

      // Load module commands
      if (module && module.getCommands()) {
        module.getCommands().forEach((command: Command) => {
          if (!this.commands.has(command.name)) {
            this.commands.set(command.name, command);
          } else {
            Logger.error(`Error: there are two commands with the same name: ${command.name}`);
          }
        });
      }
    });

    this.declareCommands();
  }

  private async declareCommands(): Promise<void> {

    const commands = Array.from(this.commands.values()).map(command => { return command.slashCommand.toJSON(); })

    try {
      // Recreate commands
      await this.restClient.put(Routes.applicationCommands(process.env.BOT_ID), { body: commands });
    } catch(error) {
      Logger.error(error);
      this.disconnect();
    }
    
    (await this.client.application?.commands.fetch()).forEach(async (applicationCommand, id: Snowflake) => {
      const command = this.commands.get(applicationCommand.name);

      if(command) {
        const permissionsPerGuild = await command.buildPermissionsPerGuild();
        permissionsPerGuild.forEach((permissions, guildId) => {
          this.client.application?.commands.permissions.set({  command: id, guild: guildId, permissions: permissions });
        });
      }
    });
  }

  /**
   * Disconnect client and shut application
   */
  private disconnect(): void {
    this.client.destroy();
    exit(0);
  }
}