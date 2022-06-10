import { Snowflake } from "discord.js";
import { Schema } from 'mongoose';

export interface IGuildGame {
  guildId: Snowflake;
  roleId: Snowflake;
  roleName: string;
  roleColor: number;
  channelId: Snowflake;
  archived: boolean;
}

export const GuildGameSchema = new Schema<IGuildGame> ({
  guildId: { type: String, required: true },
  roleId: { type: String, required: false },
  roleName: { type: String, required: false },
  roleColor: { type: Number, required: false },
  channelId: { type: String, required: false },
  archived: { type: Boolean, required: true },
});