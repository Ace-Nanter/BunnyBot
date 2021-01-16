import { Message } from "discord.js";
import { Player } from "./player.model";

export class AmongUsGame {
  gameCode: string;
  players: Map<string, Player>;
  message: Message;

  public constructor() {
    this.players = new Map();
  }
}