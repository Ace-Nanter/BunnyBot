import { Snowflake } from 'discord.js';
import { Schema } from 'mongoose';

export interface IRole extends Document {
  id: Snowflake;
  name: Snowflake;
  guildId: Snowflake;
  color: string;
}

export const RoleSchema = new Schema<IRole>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  guildId: { type: String, required: true },
  color: { type: String, required: false }
});