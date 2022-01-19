import { ImageBuffer } from "./image-buffer.model";

export class Game {
  id: string;
  name: string;
  guildId: string;
  activityId: string;
  image: ImageBuffer;     // TODO : see if it can be changed
  emojiId: string;
  emojiName: string;
  channelName: string;
  channelId: string;
  archived: boolean;
  roleId: string;
  roleName: string;
  colorRole: string;
}