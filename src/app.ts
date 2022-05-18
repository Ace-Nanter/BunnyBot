import { connect } from 'mongoose';
import { exit } from 'process';
import { Bot } from './bot';
import { Logger } from './logger/logger'

checkEnvironmentVariables();
initDatabase();
Bot.start();

/**
 * Check that environment variables are correctly set
 */
function checkEnvironmentVariables() {

  const neededVariables = [ 'DATABASE_URI', 'DATABASE_NAME', 'DATABASE_USERNAME', 'DATABASE_PASSWORD', 'LOG_CHANNEL_ID', 'TOKEN', 'BOT_ID', 'OWNER_ID' ];

  for(const variable of neededVariables) {
    if(!process.env[variable]) {
      console.error(`Error: missing environment variable "${variable}"!`);
      exit(0);
    }
  }
}

/**
 * Establish connection with database
 */
async function initDatabase() {
  await connect(process.env.DATABASE_URI, {
    dbName: process.env.DATABASE_NAME,
    auth: {
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
    },
    authSource: process.env.DATABASE_NAME
  }).catch((error) => {
    console.error('An error occurred while connecting to database!', error);
    exit(0);
  });
}

// Fail safe
process
  .on('unhandledRejection', (reason) => {
    Logger.error('Unhandled Promise rejection: ' + reason);
  })
  .on('uncaughtException', err => {
    Logger.error('Uncaught exception: ' + err);
    Bot.getInstance().disconnect(1);
  });