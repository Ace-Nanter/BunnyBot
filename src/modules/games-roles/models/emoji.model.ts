import { Snowflake } from "discord.js";

export class IEmoji {
  image: {
    data: Buffer,
    contentType: string
  };
  guildDeclarations: EmojiGuildDeclaration
}

export interface EmojiGuildDeclaration {
  guildId: Snowflake;
  name: string;
  id: Snowflake;
}