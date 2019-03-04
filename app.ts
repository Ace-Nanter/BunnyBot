/**
 * App launching. Launch both bot and website.
 */

import { BotCore } from "./src/core/bot";

// Launch Discord bot
BotCore.Instance().start();