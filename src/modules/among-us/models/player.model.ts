import { PlayerAction, PlayerColor, PlayerUpdate } from "./player-update.model";

export class Player {
  name: string;     // Among Us name
  index: number;    // Index for associating player with a reaction in Discord
  dead: boolean;
  color: PlayerColor;

  /**
   * Default constructor
   * @param playerUpdate PlayerUpdate used to build the Player object 
   * @param index Index of the player
   */
  constructor(playerUpdate: PlayerUpdate, index: number) {
    this.index = index;
    this.name = playerUpdate.name;
    this.color = playerUpdate.color;
  }

  public update(playerUpdate: PlayerUpdate) {
    switch(playerUpdate.action) {
      case PlayerAction.Died:
      case PlayerAction.Exiled:
      case PlayerAction.Disconnected:
        this.dead = true;
        break;
      case PlayerAction.Joined:
        this.dead = false;
        break;
      case PlayerAction.ChangedColor:
        this.color = playerUpdate.color;
        break;
    }
  }

  /**
   * Reset a player status
   */
  public reset(): void {
    this.dead = false;
  }
}