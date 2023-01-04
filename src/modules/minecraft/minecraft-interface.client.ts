import axios  from 'axios';
import { Logger } from '../../logger/logger';
import { Status } from "./status.type";

export class MinecraftInterfaceClient {

  constructor(private readonly serverUrl: string) { }

  /**
   * Start Minecraft Server
   */
  async startServer(): Promise<void> {
    try {
      const status = await this.getServerStatus();
      if (status === 'STOPPED') {
        await axios.post<void>(`${this.serverUrl}/commands/start`);  
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
   * Stops Minecraft server
   */
  async stopServer(): Promise<void> {
    try {
      const status = await this.getServerStatus();
      if (status === 'STARTED') {
        await axios.post<void>(`${this.serverUrl}/commands/stop`);
      }
      else if (status === 'STOPPED') {
        return Promise.reject('🔴 Server is already stopped!');
      }
    } catch (error) {
      Logger.error(error);
      return Promise.reject('❌ An error occurred...');
    }
  }

  /**
   * Retrieves server status
   * @returns 
   */
  async getServerStatus(): Promise<Status> {
    try {
      const { data } = await axios.get<Status>(`${this.serverUrl}/status/server`);

      return data;
    } catch (error) {
      Logger.error(error);
    }

    return 'UNKNOWN';
  }

  /**
   * Retrieves players connected
   */
  async getOnlinePlayers(): Promise<string[]> {
    try {
      const status = await this.getServerStatus();
      if (status === 'STARTED') {
        const { data } = await axios.get<string[]>(`${this.serverUrl}/status/players`);
        
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
}