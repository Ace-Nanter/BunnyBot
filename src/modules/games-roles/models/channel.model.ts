import { Snowflake } from "discord.js";
import { Schema } from 'mongoose';

export interface IChannel extends Document {
  id: Snowflake;
  name: Snowflake;
  guildId: Snowflake
}

export const ChannelSchema = new Schema<IChannel>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  guildId: { type: String, required: true }
})