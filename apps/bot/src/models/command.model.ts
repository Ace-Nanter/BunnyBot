import {
  CommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import { BotModule } from './bot-module.model';

export abstract class Command {
  protected module: BotModule;

  abstract name: string;
  abstract description: string;
  abstract slashCommand: SlashCommandBuilder | SlashCommandSubcommandBuilder | SlashCommandSubcommandsOnlyBuilder;
  abstract execution: (interaction: CommandInteraction) => Promise<void>;

  public constructor(module: BotModule) {
    this.module = module;
  }
}

export default Command;
