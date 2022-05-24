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
    'guildGames': { $not: { $elemMatch: { 'guildId': guildId } } },
    'banned': { $ne: true }
  });
});

export const Game: IGameModel = model<IGame, IGameModel>('games', GameSchema);