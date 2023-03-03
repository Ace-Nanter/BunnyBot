import { Logger } from '@BunnyBot/logger';
import { REST } from '@discordjs/rest';
import { ChannelType, Client, GatewayIntentBits, Snowflake } from 'discord.js';
import { Command } from './models/command.model';

export class Bot {
  // eslint-disable-next-line no-use-before-define
  private static Instance: Bot;

  private client: Client;
  private readonly restClient: REST;
  private globalCommands: Command[];
  private guildCommands: Map<Snowflake, Command[]>;

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
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
      ],
    });

    this.restClient = new REST({ version: '9' }).setToken(process.env.TOKEN);

    this.globalCommands = [];
    this.guildCommands = new Map();
  }

  private async start(): Promise<void> {
    this.client.login(process.env.TOKEN);

    this.client.once('ready', async () => {
      try {
        // Launch Logger
        await this.initLogger();

        // Load modules
        // const moduleConfigList = await ModuleConfig.getAll();
        // await this.loadModules(moduleConfigList);

        Logger.info('Bot started successfully');
      } catch (error) {
        Logger.error(error);
        // this.disconnect();
      }
    });

    // this.client.on('interactionCreate', async (interaction: Interaction) => {
    //   if (!interaction.isCommand()) {
    //     return;
    //   }

    //   this.onCommandInteraction(interaction as CommandInteraction);
    // });

    this.client.on('disconnect', () => {
      Logger.warn('Disconnecting...');
    });
  }

  private async initLogger() {
    if (process.env.LOG_CHANNEL_ID) {
      const channel = await this.client.channels.fetch(process.env.LOG_CHANNEL_ID);
      if (channel && channel.type === ChannelType.GuildText) {
        Logger.initDiscordLogger(channel);
      }
    }
  }

  // private async loadModules(moduleConfigList: IModuleConfig[]) {
  //   await moduleConfigList.forEach(async (moduleConfig: IModuleConfig) => {
  //     try {
  //       const module = await ModuleLoader.loadModule(moduleConfig);

  //       // Load module events
  //       if (module && module.getCallbacks()) {
  //         module.getCallbacks().forEach((eventType) => {
  //           this.client.on(eventType, module.getCallback(eventType));
  //         });
  //       }
  //     } catch (error) {
  //       Logger.warn(`Error while initializing module ${moduleConfig.moduleName}: ${error}`);
  //     }
  //   });

  //   await this.publishCommands();
  // }

  // /**
  //  * Disconnect client and shut application
  //  */
  // public disconnect(status?: number): void {
  //   this.client.destroy();
  //   mongoose.connection.close();
  //   exit(status);
  // }

  // /**
  //  * Adds a guild command to the bot
  //  *
  //  * @param guildId GuildId in which command should be added
  //  * @param command Command to add
  //  */
  // public addGuildCommand(guildId: Snowflake, command: Command): void {
  //   let commandList: Command[] = this.guildCommands.get(guildId);
  //   if (!commandList) {
  //     commandList = [];
  //   }

  //   commandList.push(command);
  //   this.guildCommands.set(guildId, commandList);
  // }

  // /**
  //  * Adds a global command to the bot
  //  *
  //  * @param command Global command to add
  //  */
  // public addGlobalCommand(command: Command): void {
  //   if (!this.globalCommands.find((c) => c.name === command.name)) {
  //     this.globalCommands.push(command);
  //   }
  // }

  // /**
  //  * Publish every commands for the bot
  //  *
  //  * @returns A Promise which returns when publishing is done
  //  */
  // private async publishCommands(): Promise<void> {
  //   try {
  //     if (this.globalCommands && this.globalCommands.length > 0) {
  //       await this.publishGlobalCommands();
  //     }

  //     if (this.guildCommands && this.guildCommands.size > 0) {
  //       this.guildCommands.forEach(async (commandList: Command[], guildId: string) => {
  //         if (commandList && commandList.length > 0) {
  //           await this.publishGuildCommands(guildId, commandList);
  //         }
  //       });
  //     }
  //   } catch (error) {
  //     return Promise.reject();
  //   }

  //   return Promise.resolve();
  // }

  // /**
  //  * Publish global commands
  //  *
  //  * @param commandList List of commands to publish
  //  * @returns A Promise which returns when publishing is done
  //  */
  // private async publishGlobalCommands(): Promise<void> {
  //   const commands = this.globalCommands.map((command) => {
  //     return command.slashCommand.toJSON();
  //   });

  //   try {
  //     await this.restClient.put(Routes.applicationCommands(process.env.BOT_ID), { body: commands });
  //   } catch (error) {
  //     Logger.error('Error while publishing global commands! ' + error);
  //     return Promise.reject();
  //   }
  // }

  // /**
  //  * Publish guild commands
  //  *
  //  * @param guildId Guild in which commands should be published
  //  * @param commandList List of commands to publish
  //  * @returns A Promise which returns when publishing is done
  //  */
  // private async publishGuildCommands(guildId: Snowflake, commandList: Command[]): Promise<void> {
  //   const commands = commandList.map((command) => {
  //     return command.slashCommand.toJSON();
  //   });

  //   try {
  //     await this.restClient.put(Routes.applicationGuildCommands(process.env.BOT_ID, guildId), { body: commands });
  //   } catch (error) {
  //     Logger.error(`Error while publishing commands for guild ${guildId} : ${error}`);
  //     return Promise.reject();
  //   }
  // }

  // /**
  //  * Defines what happens when a command interaction is received
  //  *
  //  * @param commandInteraction CommandInteraction received
  //  * @returns A Promise which ends when command is executed
  //  */
  // private async onCommandInteraction(commandInteraction: CommandInteraction): Promise<void> {
  //   let command: Command = null;

  //   if (commandInteraction.guildId) {
  //     const guildCommandList = this.guildCommands.get(commandInteraction.guildId);

  //     if (guildCommandList && guildCommandList.length > 0) {
  //       command = guildCommandList.find((c) => c.name === commandInteraction.commandName);
  //     }
  //   }

  //   if (!command) {
  //     command = this.globalCommands.find((c) => c.name === commandInteraction.commandName);
  //   }

  //   if (command) {
  //     command.execution(commandInteraction);
  //   } else {
  //     console.warn(`Error: command ${commandInteraction.commandName} not found!`);
  //     return;
  //   }
  // }
}

export default Bot;
