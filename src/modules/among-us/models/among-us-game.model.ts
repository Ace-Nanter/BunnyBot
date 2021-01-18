import { Logger } from './../../../logger/logger';
import { exception } from 'console';
import { PlayerUpdate } from './player-update.model';
import { Snowflake } from "discord.js";
import { Player } from "./player.model";

export class AmongUsGame {
  gameCode: string;
  players: Map<string, Player>;
  snowflakeToName: Map<Snowflake, string>;
  indexes: number[] = [];

  public constructor() {
    this.players = new Map();
    this.snowflakeToName = new Map();

    for(let i = 1 ; i <= 10 ; i++) {
      this.indexes.push(i);
    }
  }

  /**
   * Adds a player in the player list
   * @param playerUpdate Player to add in the list
   */
  public addPlayer(playerUpdate: PlayerUpdate): void {
    this.players.set(playerUpdate.name, new Player(playerUpdate, this.indexes.shift()));
  }

  /**
   * Deletes a player from the player list
   * @param name Name of the player to delete
   */
  public deletePlayer(name: string): void {
    const player = this.players.get(name);

    if(!player) {
      Logger.error('There is no player with such name!');
      throw new exception('There is no player with such name!');
    }

    this.indexes.push(player.index);
    this.players.delete(name);
  }
}