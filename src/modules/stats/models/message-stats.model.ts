import { Snowflake } from 'discord.js';
import { model, Model, Schema, Document } from 'mongoose';

export interface IMessageStats extends Document {
  date: Date;
  guildId: Snowflake;
  members: { userId: Snowflake, messages: number }[];
  roles: { roleId: Snowflake, messages: number }[];
  channels: { channelId: Snowflake, messages: number }[];
  total: number;
}

export interface IMessageStatsModel extends Model<IMessageStats> {
  findOrCreateByGuildIdAndDate(guildId: Snowflake, date: Date): Promise<IMessageStats>;
}

const MessageStatsSchema = new Schema<IMessageStats>({
  date: { type: Date, required: true },
  guildId: { type: String, required: true},
  members: {
    type: [new Schema<{userId: Snowflake, messages: number}>({
      userId: { type: String, required: true },
      messages: { type: Number, required: true }
    })], required: false
  },
  roles: {
    type: [new Schema<{ roleId: Snowflake, messages: number }>({
      roleId: { type: String, required: true },
      messages: { type: Number, required: true }
    })], required: false
  },
  channels: {
    type: [new Schema<{channelId: Snowflake, messages: number}>({
      channelId: { type: String, required: true },
      messages: { type: Number, required: true }
    })], required: false
  },
  total: { type: Number, required: true }
}, {
  collection: 'messageStats',
  timeseries: {
    timeField: 'date',
    metaField: 'guildId',
    granularity: 'hours',
  }
});

MessageStatsSchema.static('findOrCreateByGuildIdAndDate', async (guildId: Snowflake, date: Date): Promise<IMessageStats> => {
  let messageStat: IMessageStats = await MessageStats.findOne({
    'date': { 
      $gte: new Date(date).setUTCHours(0, 0, 0), 
      $lte: new Date(date).setUTCHours(23, 59, 59)
    },
    'guildId': guildId
  });

  if (!messageStat) {
    messageStat = new MessageStats({
      date: new Date().setUTCHours(0, 0, 1),
      guildId: guildId,
      members: [],
      roles: [],
      channels: [],
      total: 0
    });

    await messageStat.save();
  }

  return messageStat;
});

export const MessageStats: IMessageStatsModel = model<IMessageStats, IMessageStatsModel>('messageStats', MessageStatsSchema);