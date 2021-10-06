import { exit } from 'process';
import { Bot } from './bot';
import { Dao } from './dao/dao';
import { DaoType } from './dao/dao-type';

checkEnvironmentVariables();
Dao.initDao(DaoType.Mongo, process.env.DATABASE_URI, process.env.DATABASE_NAME);
Bot.start();

function checkEnvironmentVariables() {

  const neededVariables = [ 'DATABASE_URI', 'DATABASE_NAME', 'LOG_CHANNEL_ID', 'TOKEN', 'BOT_ID', 'OWNER_ID' ];

  for(const variable of neededVariables) {
    if(!process.env[variable]) {
      console.error(`Error: missing environment variable "${variable}"!`);
      exit(0);
    }
  }
}