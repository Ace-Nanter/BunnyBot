import { SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandBuilder, SlashCommandSubcommandsOnlyBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';
import { BotModule } from './bot-module.model';
export abstract class Command {

  protected module: BotModule;

  abstract name: string;
  abstract description: string;
  abstract slashCommand: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandBuilder | SlashCommandSubcommandsOnlyBuilder;
  abstract execution: (interaction: ChatInputCommandInteraction) => Promise<void>;

  public constructor(module: BotModule) {
    this.module = module;
  }
}