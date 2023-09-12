import { ActivityOptions } from 'discord.js';
import { model, Schema } from 'mongoose';

export interface IActivity extends Document {
  activity: string;
  options: ActivityOptions;
}

export const ActivityOptionsSchema = new Schema<ActivityOptions>({
  name: { type: String, required: false },
  url: { type: String, required: false },
  type: { type: Number, required: false },
});

export const ActivitySchema = new Schema<IActivity>(
  {
    activity: { type: String, required: true },
    options: { type: ActivityOptionsSchema, required: true },
  },
  { collection: 'activity' }
);

export const Activity = model<IActivity>('activity', ActivitySchema);
