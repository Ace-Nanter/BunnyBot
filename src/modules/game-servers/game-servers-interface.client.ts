import axios  from 'axios';
import { Logger } from '../../logger/logger';
import { Status } from "./models/status.type";

export class GameServersInterfaceClient {

  constructor(private readonly serverUrl: string) { }

  /**
   * Retrieves server status
   * @returns 
   */
  async getServerStatus(game: string): Promise<Status> {
    try {
      const { data } = await axios.get<Status>(`${this.serverUrl}/${game}/status`);

      return data;
    } catch (error) {
      Logger.error(error);
    }

    return 'UNKNOWN';
  }

  /**
   * Retrieves players connected
   */
  async getOnlinePlayers(game: string): Promise<string[]> {
    try {
      const status = await this.getServerStatus(game);
      if (status === 'STARTED') {
        const { data } = await axios.get<string[]>(`${this.serverUrl}/${game}/players`);
        
        return data;
      }
      else {
        return Promise.reject('🔴 Server is down!');
      }
    } catch (error) {
      Logger.error(error);
      return Promise.reject('❌ An error occurred.');
    }
  }

  /**
   * Start a game server
   */
  async startServer(game: string): Promise<void> {
    try {
      const status = await this.getServerStatus(game);
      if (status === 'STOPPED') {
        await axios.post<void>(`${this.serverUrl}/${game}/start`);  
      }
      else if (status === 'STARTED') {
        return Promise.reject('🟢 Server is already running!');
      }
    } catch (error) {
      Logger.error(error);
      return Promise.reject('❌ An error occurred...');
    }
  }

  /**
   * Stops game server
   */
  async stopServer(game: string): Promise<void> {
    try {
      const status = await this.getServerStatus(game);
      if (status === 'STARTED') {
        await axios.post<void>(`${this.serverUrl}/${game}/stop`);
      }
      else if (status === 'STOPPED') {
        return Promise.reject('🔴 Server is already stopped!');
      }
    } catch (error) {
      Logger.error(error);
      return Promise.reject('❌ An error occurred...');
    }
  }
}