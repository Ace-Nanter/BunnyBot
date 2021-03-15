import { VoiceChannel } from 'discord.js';
import { MapEnum } from './map.enum';
import { Player } from './player.model';
export class Instance {

  players: Player[];
  map: MapEnum;
  allMuted: boolean;

  private aliveVoiceChannel: VoiceChannel;
  private deadVoiceChannel: VoiceChannel;
}