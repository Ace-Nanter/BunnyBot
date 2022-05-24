import { Snowflake } from 'discord.js';
import { Schema, model } from 'mongoose';
import { IEmoji } from './models/emoji.model';
import { IRole } from './models/role.model';

export interface IGame extends Document {
  applicationId: string;
  gameName: string;
  enabled: boolean;
  role: IRole;
  channelId: Snowflake;
  emoji: IEmoji;        // Mongo external key  
}

const GameSchema = new Schema<IGame>({
  applicationId: { type: String, required: true },
  gameName: { type: String, required: true },
  enabled: { type: Boolean, required: true },
  role: { type: Schema.Types.ObjectId, ref: 'roles', required: false },
  channelId: { type: String, required: false },
  emoji: { type: Schema.Types.ObjectId, ref: 'emojis' },

}, { collection: 'games' });

export const Game = model<IGame>('games', GameSchema);