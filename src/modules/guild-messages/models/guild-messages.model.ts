import { Schema, model } from 'mongoose'
import { Snowflake } from 'discord.js';

export interface IGuildMessage extends Document {
  guildId: Snowflake;
  channelId: Snowflake;
  enabled: true;
  message: string;
  type: GuildMessageType;
}

export const GuildMessageSchema = new Schema<IGuildMessage>({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true },
  enabled: { type: Boolean, required: true },
  message: { type: String, required: true},
  type: { type: Number, required: true}
}, { collection: 'messages' });

export const GuildMessage = model<IGuildMessage>('messages', GuildMessageSchema);

export enum GuildMessageType {
  JOINING,
  LEAVING
}