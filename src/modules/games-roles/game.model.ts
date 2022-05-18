import { Schema, model } from 'mongoose';

export interface IGame {
  roleId: string;
  emojiId: string;
  emojiName: string;
  gameName: string;
  activityId: string;
}

const GameSchema = new Schema<IGame>({
  roleId: String,
  emojiId: String,
  emojiName: String,
  gameName: String,
  activityId: String,
}, { collection: 'games' });

export const Game = model<IGame>('games', GameSchema);