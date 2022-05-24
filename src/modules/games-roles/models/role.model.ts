import { Snowflake } from 'discord.js';
import { Schema, model } from 'mongoose';

export interface IRole extends Document {
  id: Snowflake;
  name: Snowflake;
  color: string;
}

export const RoleSchema = new Schema<IRole>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  color: { type: String, required: false }
}, { collection: 'roles' });

export const Role = model<IRole>('roles', RoleSchema);