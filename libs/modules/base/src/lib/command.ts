import {
  CommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  Snowflake,
} from 'discord.js';

export interface Command {
  /** (Optional) Command's guild ID. Its presence tells if the command is a guild command. */
  guildId?: Snowflake;

  /** Command name */
  name: string;

  /** Command description */
  description: string;

  /** SlashCommandBuilder */
  slashCommand:
    | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>
    | SlashCommandSubcommandBuilder
    | SlashCommandSubcommandsOnlyBuilder;

  /** Command callback executed when the command is called */
  execution(interaction: CommandInteraction): Promise<void>;
}

export default Command;
