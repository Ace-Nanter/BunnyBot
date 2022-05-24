import { Snowflake } from "discord.js";
import { Schema } from 'mongoose';
import { ChannelSchema, IChannel } from "./channel.model";
import { IEmoji } from "./emoji.model";
import { IRole, RoleSchema } from "./role.model";

export interface IGuildGame {
  guildId: Snowflake;
  role: IRole;
  channel: IChannel;
  archived: boolean;
  emoji: IEmoji;
}

export const GuildGameSchema = new Schema<IGuildGame> ({
  guildId: { type: String, required: true },
  role: { type: RoleSchema, ref: 'roles', required: false },
  channel: { type: ChannelSchema, required: false },
  archived: { type: Boolean, required: true },
  emoji: { type: Schema.Types.ObjectId, ref: 'emojis', required: false },
});