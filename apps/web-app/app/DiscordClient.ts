import axios from 'axios';
import { DISCORD_API_URL } from './config';

const DiscordClient = () => {
  const defaultOptions = {
    baseURL: DISCORD_API_URL,
  };

  const instance = axios.create(defaultOptions);

  instance.interceptors.request.use(async (request) => {
    if (process.env.BOT_TOKEN) {
      request.headers.Authorization = `Bot ${process.env.BOT_TOKEN}`;
    }

    return request;
  });

  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      console.log(`error`, error);
    }
  );

  return instance;
};

export default DiscordClient();
