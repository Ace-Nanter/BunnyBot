import { Snowflake } from 'discord.js';
import { model, Model, Schema } from 'mongoose';
import { GuildGameSchema, IGuildGame } from './guild-game.model';

export interface IGame extends Document {
  applicationId: string;
  gameName: string;
  banned: boolean;
  guildGames: IGuildGame[];
}

export interface IGameModel extends Model<IGame> {
  getGamesThatCanBeActivatedForGuild(guildId: Snowflake): Promise<Array<IGame>>;
  getGamesThatCanBeDeactivatedForGuild(guildId: Snowflake): Promise<Array<IGame>>;
  getGamesForGuild(guildId: Snowflake): Promise<Array<IGame>>;
  getGamesWithRolesForGuild(guildId: Snowflake): Promise<Array<IGame>>;
  getGamesWithChannelsForGuild(guildId: Snowflake): Promise<Array<IGame>>;
  getArchivedGamesForGuild(guildId: Snowflake): Promise<Array<IGame>>;
}

const GameSchema = new Schema<IGame>({
  applicationId: { type: String, required: true },
  gameName: { type: String, required: true },
  guildGames: { type: [GuildGameSchema], required: true },
  banned: { type: Boolean, required: false },
}, { collection: 'games' });

GameSchema.static('getGamesThatCanBeActivatedForGuild', async (guildId: Snowflake): Promise<Array<IGame>> => {
  // Find games which are not associated to guild yet and which are not banned
  return await Game.find({
    'applicationId': { $ne: null },
    'guildGames': { $not: { $elemMatch: { 'guildId': guildId } } },
    'banned': { $ne: true }
  });
});

GameSchema.static('getGamesThatCanBeDeactivatedForGuild', async (guildId: Snowflake): Promise<Array<IGame>> => {
  // Find games which are declared in guild
  return await Game.find({
    'applicationId': { $ne: null },
    'banned': { $ne: true },
    'guildGames': { $elemMatch: {
      'guildId': guildId
    } },
  });
});

GameSchema.static('getGamesForGuild', async (guildId: Snowflake): Promise<Array<IGame>> => {
  // Find games which are declared in guild
  return await Game.find({
    'applicationId': { $ne: null },
    'banned': { $ne: true },
    'guildGames': { $elemMatch: {
      'guildId': guildId
    } },
  });
});

GameSchema.static('getGamesWithRolesForGuild', async (guildId: Snowflake): Promise<Array<IGame>> => {
  // Find games which are declared in guild and not archived
  return await Game.find({
    'banned': { $ne: true },
    'guildGames': { $elemMatch: {
      'guildId': guildId,
      'archived': { $ne: true },
      'roleId': { $ne: null }
    } },
  });
});

GameSchema.static('getGamesWithChannelsForGuild', async (guildId: Snowflake): Promise<Array<IGame>> => {
  // Find games which are declared in guild and not archived
  return await Game.find({
    'banned': { $ne: true },
    'guildGames': { $elemMatch: {
      'guildId': guildId,
      'archived': { $ne: true },
      'channelId': { $ne: null }
    } },
  });
});

GameSchema.static('getArchivedGamesForGuild', async (guildId: Snowflake): Promise<Array<IGame>> => {
  // Find games which are declared in guild and not archived
  return await Game.find({
    'banned': { $ne: true },
    'guildGames': { $elemMatch: {
      'guildId': guildId,
      'archived': true
    } },
  });
});



export const Game: IGameModel = model<IGame, IGameModel>('games', GameSchema);