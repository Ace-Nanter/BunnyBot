import { SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { ActionRow, ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, Snowflake } from 'discord.js';
import { Command } from '../../../models/command.model';
import { GamesRolesModule } from '../games-roles.module';
import { Game, IGame } from '../models/game.model';
import { IGuildGame } from '../models/guild-game.model';


export default class AdminGamesRolesCommand extends Command {
  name = 'admin-games-roles';
  visible = true;
  description = 'Displays admin commands for games roles';

  slashCommand = new SlashCommandSubcommandBuilder()
    .setName(this.name)
    .setDescription(this.description)
  
  execution = async (interaction: CommandInteraction): Promise<void> => {
    await interaction.deferReply({ ephemeral: true });
    this.sendAdminMessage(interaction);
  };

  private async sendAdminMessage(interaction: CommandInteraction): Promise<void> {

    const firstRow = new ActionRowBuilder();
    const secondRow = new ActionRowBuilder();

    const games = await Game.getGamesForGuild(interaction.guildId);
    const guildGames: IGuildGame[] = games.map(g => g.guildGames.find(guildGame => guildGame.guildId === interaction.guildId));

    // No games = nothing to do
    if (!guildGames) {
      return ;
    }

    const addGameButton = new ButtonBuilder()
      .setCustomId('games-roles-create')
      .setLabel('Create a game')
      .setEmoji('➕')
      .setStyle(ButtonStyle.Success)

    firstRow.addComponents(addGameButton);

    const activateGameButton = new ButtonBuilder()
      .setCustomId('games-roles-activate')
      .setLabel('Activate a game')
      .setEmoji('➕')
      .setStyle(ButtonStyle.Success);

    firstRow.addComponents(activateGameButton);

    const deactivateButton = new ButtonBuilder()
      .setCustomId('games-roles-deactivate')
      .setLabel('Remove a game from the server')
      .setEmoji('🗑')
      .setStyle(ButtonStyle.Danger);

    firstRow.addComponents(deactivateButton);

    const archiveButton = new ButtonBuilder()
      .setCustomId('games-roles-archive')
      .setLabel('Archive a game')
      .setEmoji('📥')
      .setDisabled(!this.gamesRolesModule.archiveCategoryChannel || guildGames.every(g => g.archived))
      .setStyle(ButtonStyle.Danger);

    secondRow.addComponents(archiveButton);
    
    const unarchiveButton = new ButtonBuilder()
      .setCustomId('games-roles-unarchive')
      .setLabel('Unarchive a game')
      .setEmoji('📤')
      .setDisabled(!this.gamesRolesModule.archiveCategoryChannel || !guildGames.some(g => g.archived))
      .setStyle(ButtonStyle.Primary);

    secondRow.addComponents(unarchiveButton);

    const sendJoinMessage = new ButtonBuilder()
      .setCustomId('games-roles-send-message')
      .setLabel('Put a join button here')
      .setEmoji('📩')
      .setStyle(ButtonStyle.Primary);

    secondRow.addComponents(sendJoinMessage);

    const embed = this.createAdminMessageEmbed(games, interaction);
    interaction.editReply({ embeds: [embed], components: [ firstRow, secondRow ] });
  }

  private get gamesRolesModule(): GamesRolesModule {
    return this.module as GamesRolesModule;
  }

  private createAdminMessageEmbed(games: IGame[], interaction: CommandInteraction): MessageEmbed {

    const activatedGames = this.getActivatedGamesForGuild(games, interaction.guildId);
    const archivedGames = this.getArchivedGamesForGuild(games, interaction.guildId);

    const fields: EmbedFieldData[] = [];
    if (activatedGames.length > 0) {
      fields.push({ name: 'Activated games in this server', value: activatedGames, inline: true });
    }

    if (archivedGames.length > 0) {
      fields.push({ name: 'Archived games in this server', value: archivedGames, inline: true });
    }

    return new MessageEmbed({
      author: {
        name: interaction.guild.me.displayName,
        iconURL: interaction.guild.me.displayAvatarURL()
      },
      color: 'RED',
      title: 'Admin Panel',
      description: 'Welcome in admin panel! Please feel free to use one of these admin commands',
      fields: fields
    });
  }

  private getActivatedGamesForGuild(games: IGame[], guildId: Snowflake): string {
    return games
      .filter(g => g.guildGames.some(guildGame => guildGame.guildId === guildId))
      .map(g => g.gameName)
      .join('\r\n');
  }

  private getArchivedGamesForGuild(games: IGame[], guildId: Snowflake): string {
    return games
      .filter(g => g.guildGames.some(guildGame => guildGame.guildId === guildId && guildGame.archived))
      .map(g => g.gameName)
      .join('\r\n');
  }
}
