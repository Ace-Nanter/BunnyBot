import { MongoDao } from './dao/mongo-dao';
import { DiscordLogger } from './logger/discord-logger';
import { Bot } from './bot';
import { Dao } from './dao/dao';

Dao.initDao(DaoType.Mongo, process.env.DATABASE_URI, process.env.DATABASE_NAME);

const bot = new Bot();
bot.start();