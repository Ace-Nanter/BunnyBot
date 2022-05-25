import { Guild, GuildMember, MessageFlags, SelectMenuInteraction } from "discord.js";
import { Logger } from "../../../logger/logger";
import { Game, IGame } from "../models/game.model";

export class RoleManager {

  constructor(private readonly guild: Guild) { }

  public async manageSelectMenuInteraction(interaction: SelectMenuInteraction): Promise<void> {
    await interaction.deferUpdate();

    if (!interaction.values) return ;

    const member: GuildMember = await this.guild.members.fetch(interaction.member.user.id);
    const games = await Game.getGamesWithRolesForGuild(interaction.guildId);

    await Promise.all(games.map(async (game: IGame) => {
      try {
        await this.manageInteractionForGame(interaction, game, member);
      } catch (error) {
        Logger.warn(error);
      }
    }));

    
    const message = await interaction.editReply({ content: 'Roles updated!', components: []});
    if (message.flags != MessageFlags.FLAGS.EPHEMERAL) {
      setTimeout(() => { interaction.deleteReply(); }, 5000);
    }
  }

  private async manageInteractionForGame(interaction: SelectMenuInteraction, game: IGame, member: GuildMember) {

    // Get guildGame
    const guildGame = game.guildGames.find(g => g.guildId === interaction.guildId);

    if (!guildGame || !guildGame.roleId) {
      throw `An error occurred for game with applicationId ${game.applicationId} in guild ${interaction.guildId}`;
    }

    if (interaction.values.includes(game.applicationId)) {
      await member.roles.add(guildGame.roleId);
    } else {
      await member.roles.remove(guildGame.roleId);
    }
  }
}