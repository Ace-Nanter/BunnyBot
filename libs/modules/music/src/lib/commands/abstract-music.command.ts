import { Command } from '@BunnyBot/modules/base';
import {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  CommandInteraction,
  CacheType,
  Snowflake,
} from 'discord.js';
import MusicModule from '../music-module';

export default abstract class AbstractMusicCommand implements Command {
  protected module: MusicModule;
  guildId?: Snowflake;

  abstract name: string;
  abstract description: string;
  abstract slashCommand:
    | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>
    | SlashCommandSubcommandBuilder
    | SlashCommandSubcommandsOnlyBuilder;
  abstract execution(interaction: CommandInteraction<CacheType>): Promise<void>;

  constructor(module: MusicModule) {
    this.module = module;
  }
}
