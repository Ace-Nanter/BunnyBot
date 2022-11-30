import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { default as GetOnlinePlayersCommandClass } from './get-online-players.command';
import { default as GetServerStatusCommandClass } from './get-server-status.command';
import MinecraftBaseCommand from './minecraft-base-command.model';
import { default as StartServerCommandClass } from './start-server.command';
import { default as StopServerCommandClass } from './stop-server.command';

export default class MinecraftCommand extends MinecraftBaseCommand {
  name = 'minecraft';
  visible = true;
  description = 'Every command usable to reach Minecraft server';

  private getStatusCommand = new GetServerStatusCommandClass(this.minecraftModule);
  private startServerCommand = new StartServerCommandClass(this.minecraftModule);
  private stopServerCommand = new StopServerCommandClass(this.minecraftModule);
  private getOnlinePlayersCommand = new GetOnlinePlayersCommandClass(this.minecraftModule);
  
  slashCommand = new SlashCommandBuilder()
    .setName(this.name)
    .setDescription(this.description)
    .setDefaultPermission(false)
    .addSubcommand(this.getStatusCommand.slashCommand)
    .addSubcommand(this.startServerCommand.slashCommand)
    .addSubcommand(this.stopServerCommand.slashCommand)
    .addSubcommand(this.getOnlinePlayersCommand.slashCommand)

  execution = async (interaction: CommandInteraction): Promise<void> => {
    switch (interaction.options.getSubcommand()) {
      case 'status':
        this.getStatusCommand.execution(interaction);
        break;
      case 'start':
        this.startServerCommand.execution(interaction);
        break;
      case 'stop':
        this.stopServerCommand.execution(interaction);
        break;
      case 'players':
        this.getOnlinePlayersCommand.execution(interaction);
        break;
    }
  };
}