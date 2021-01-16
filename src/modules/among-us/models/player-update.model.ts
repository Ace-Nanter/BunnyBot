export class PlayerUpdate {
  public action: PlayerAction;
  public name: string;
  public isDead: boolean;
  public disconnected: boolean;
  public color: PlayerColor;

  public constructor(data: any) {
    this.action = data['Action'];
    this.name = data['Name'];
    this.isDead = data['isDead'];
    this.disconnected = data['disconnected'];
    this.color = data['color'];
  }
}

export enum PlayerAction {
  Joined,
  Left,
  Died,
  ChangedColor,
  ForceUpdated,
  Disconnected,
  Exiled
}

export enum PlayerColor {
  Red = 0,
  Blue = 1,
  Green = 2,
  Pink = 3,
  Orange = 4,
  Yellow = 5,
  Black = 6,
  White = 7,
  Purple = 8,
  Brown = 9,
  Cyan = 10,
  Lime = 11
}