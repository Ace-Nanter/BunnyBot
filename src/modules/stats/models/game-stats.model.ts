import { Snowflake } from 'discord.js';
import { Document, model, Model, Schema } from 'mongoose';

export interface IGameStats extends Document {
  startDate: Date;
  endDate: Date;
  userId: Snowflake;
  applicationId: string;
}

export interface IGameStatsModel extends Model<IGameStats> {
  findLastGameStat(guildId: Snowflake, userId: Snowflake, applicationId: string): Promise<IGameStats>;
}

const GameStatsSchema = new Schema<IGameStats>({
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  userId: { type: String, required: true },
  applicationId: { type: String, required: true },
}, {
  collection: 'gameStats',
  timeseries: {
    timeField: 'date',
    metaField: 'guildId',
    granularity: 'minutes',
  }
});

GameStatsSchema.static('findLastGameStat', async (guildId: Snowflake, userId: Snowflake, applicationId: string): Promise<IGameStats> => {
  return await GameStats.findOne({
    startDate: { 
      $gte: new Date().setUTCHours(0, 0, 0), 
      $lte: new Date().setUTCHours(23, 59, 59)
    },
    guildId: guildId,
    userId: userId,
    applicationId: applicationId
  }, { sort: { 'startDate': -1 }});
});


export const GameStats: IGameStatsModel = model<IGameStats, IGameStatsModel>('gameStats', GameStatsSchema);