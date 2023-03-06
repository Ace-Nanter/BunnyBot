import {
  CommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  Snowflake,
} from 'discord.js';
import { BotModule } from './bot-module';

export interface Command {
  /** Module associated to the command */
  module: BotModule;

  /** (Optional) Command's guild ID. Its presence tells if the command is a guild command. */
  guildId?: Snowflake;

  /** Command name */
  name: string;

  /** Command description */
  description: string;

  /** SlashCommandBuilder */
  slashCommand: SlashCommandBuilder | SlashCommandSubcommandBuilder | SlashCommandSubcommandsOnlyBuilder;

  /** Command callback executed when the command is called */
  execution: (interaction: CommandInteraction) => Promise<void>;
}

export default Command;
