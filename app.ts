/**
 * App launching. Launch both bot and website.
 */

import { Bot } from "./src/core/bot";

// Launch Discord bot
Bot.Instance().start();