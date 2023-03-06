import { Logger } from '@BunnyBot/logger';
import { BotModule, Command, IModuleConfig, ModuleConfig } from '@BunnyBot/modules/base';
import { disconnectMongo } from '@BunnyBot/mongo-client';
import { REST } from '@discordjs/rest';
import { ChannelType, Client, CommandInteraction, GatewayIntentBits, Interaction, Routes, Snowflake } from 'discord.js';
import initModule from './init-module';

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
        const moduleConfigList = await ModuleConfig.getAll();
        await this.loadModules(moduleConfigList);

        Logger.info('Bot started successfully');
      } catch (error) {
        Logger.error(error);
        this.disconnect();
      }
    });

    this.client.on('interactionCreate', async (interaction: Interaction) => {
      if (!interaction.isCommand()) {
        return;
      }

      this.onCommandInteraction(interaction as CommandInteraction);
    });

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

  private async loadModules(moduleConfigList: IModuleConfig[]) {
    await moduleConfigList
      .filter((module) => module.enabled)
      .forEach(async (moduleConfig: IModuleConfig) => {
        // Fetch module and launch initialization
        await initModule(this.client, moduleConfig)
          .then((module) => {
            // Load module callbacks
            this.loadCallbacks(module);

            // Load module commands
            this.loadCommands(module);
          })
          .catch((error) => {
            Logger.error(`Error while initializing module ${moduleConfig.moduleName}: ${error}`);
          });
      });

    await this.publishCommands();
  }

  /**
   * Disconnect client and shut application
   */
  public disconnect(status?: number): void {
    this.client.destroy();
    disconnectMongo();
    process.exit(status);
  }

  /**
   * Loads module callbacks
   *
   * @param module Module from which callbacks should be loaded
   */
  private loadCallbacks(module: BotModule) {
    if (module && module.getCallbacks()) {
      module.getCallbacks().forEach((eventType) => {
        this.client.on(eventType, module.getCallback(eventType));
      });
    }
  }

  /**
   * Loads module commands
   *
   * @param module Module from which commands should be loaded
   * @returns Nothing
   */
  private loadCommands(module: BotModule) {
    const commands = module.getCommands();

    if (!commands) {
      return;
    }

    commands.forEach((command: Command) => {
      if (command.guildId) {
        // Add guild command
        let commandList: Command[] = this.guildCommands.get(command.guildId);
        if (!commandList) {
          commandList = [];
        }

        commandList.push(command);
        this.guildCommands.set(command.guildId, commandList);
      } else if (!this.globalCommands.find((c) => c.name === command.name)) {
        // Add global command if not already added
        this.globalCommands.push(command);
      }
    });
  }

  /**
   * Publish every commands for the bot
   *
   * @returns A Promise which returns when publishing is done
   */
  private async publishCommands(): Promise<void> {
    try {
      if (this.globalCommands && this.globalCommands.length > 0) {
        await this.publishGlobalCommands();
      }

      if (this.guildCommands && this.guildCommands.size > 0) {
        this.guildCommands.forEach(async (commandList: Command[], guildId: string) => {
          if (commandList && commandList.length > 0) {
            await this.publishGuildCommands(guildId, commandList);
          }
        });
      }
    } catch (error) {
      return Promise.reject();
    }

    return Promise.resolve();
  }

  /**
   * Publish global commands
   *
   * @param commandList List of commands to publish
   * @returns A Promise which returns when publishing is done
   */
  private async publishGlobalCommands(): Promise<void> {
    const commands = this.globalCommands.map((command) => command.slashCommand.toJSON());

    try {
      await this.restClient.put(Routes.applicationCommands(process.env.BOT_ID), { body: commands });
    } catch (error) {
      const errorMessage = `Error while publishing global commands: ${error}`;
      Logger.error(errorMessage);
      Promise.reject(errorMessage);
    }

    return Promise.resolve();
  }

  /**
   * Publish guild commands
   *
   * @param guildId Guild in which commands should be published
   * @param commandList List of commands to publish
   * @returns A Promise which returns when publishing is done
   */
  private async publishGuildCommands(guildId: Snowflake, commandList: Command[]): Promise<void> {
    const commands = commandList.map((command) => command.slashCommand.toJSON());

    try {
      await this.restClient.put(Routes.applicationGuildCommands(process.env.BOT_ID, guildId), { body: commands });
    } catch (error) {
      const errorMessage = `Error while publishing commands for guild ${guildId}: ${error}`;
      Logger.error(errorMessage);
      Promise.reject(errorMessage);
    }

    return Promise.resolve();
  }

  /**
   * Defines what happens when a command interaction is received
   *
   * @param commandInteraction CommandInteraction received
   * @returns A Void promise
   */
  private async onCommandInteraction(commandInteraction: CommandInteraction): Promise<void> {
    let command: Command = null;

    // Try to find command in guilds commands
    if (commandInteraction.guildId) {
      const guildCommandList = this.guildCommands.get(commandInteraction.guildId);

      if (guildCommandList && guildCommandList.length > 0) {
        command = guildCommandList.find((c) => c.name === commandInteraction.commandName);
      }
    }

    // Try to find command in global commands
    if (!command) {
      command = this.globalCommands.find((c) => c.name === commandInteraction.commandName);
    }

    // Execute command if found
    if (command) {
      command.execution(commandInteraction);
    } else {
      Logger.warn(`Error: command ${commandInteraction.commandName} not found!`);
    }
  }
}

export default Bot;
