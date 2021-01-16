import { textChangeRangeIsUnchanged } from "typescript";
import { Bot } from "../../../bot";
import { PlayerColor, PlayerUpdate } from "./player-update.model";

export class Player {
  id: string;       // Discord ID
  name: string;     // Among Us name
  dead: boolean;
  disconnected: boolean;
  color: PlayerColor;

  constructor(playerUpdate: PlayerUpdate) {
    this.id = null;
    this.name = playerUpdate.name;
    this.dead = playerUpdate.isDead;
    this.color = playerUpdate.color;
  }

  public update(playerUpdate: PlayerUpdate) {
    this.dead = playerUpdate.isDead;
    this.color = playerUpdate.color;
  }

  public setDead(dead: boolean) {
    this.dead = dead;
  }

  public setDiscordId(id: string) {
    this.id = id;
  }
}

/*

const msg = await channel.messages.fetch(MessageID);

msg.reactions.resolve("REACTION EMOJI, 
REACTION OBJECT OR REACTION ID").users.remove("ID OR OBJECT OF USER TO REMOVE");

*/
