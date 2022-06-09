import { ActivityOptions } from 'discord.js';
import { model, Schema } from 'mongoose';

export interface IActivityDocument extends Document {
    activity: string;
    options: ActivityOptions;
}

export const ActivityOptionsSchema = new Schema<ActivityOptions> ({
  name: { type: String, required: false },
  url: { type: String, required: false},
  type: { type: String, required: true}
});

export const ActivitySchema = new Schema<IActivityDocument> ({
  activity: { type: String, required: true },
  options: { type: ActivityOptionsSchema, required: true }
}, { collection: 'activity' });

export const Activity = model<IActivityDocument>('activity', ActivitySchema);