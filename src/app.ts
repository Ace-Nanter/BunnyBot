import { Bot } from './bot';
import { Dao } from './dao/dao';

Dao.initDao(DaoType.Mongo, process.env.DATABASE_URI, process.env.DATABASE_NAME);
Bot.start();