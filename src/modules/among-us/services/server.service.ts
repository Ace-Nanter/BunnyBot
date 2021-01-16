import * as bodyParser from 'body-parser';
import { EventEmitter } from 'events';
import * as express from 'express';
import { PlayerUpdate } from '../models/player-update.model';

export class ServerService {

  private static instance: ServerService;

  public static eventEmitter: EventEmitter;

  private constructor() { }

  public static getInstance(): ServerService {
    
    if(!ServerService.instance) {
      ServerService.instance = new ServerService();
    }

    return ServerService.instance;
  }

  public static init(port: number): void {

    const app = express();
    const router = express.Router();
    app.use(bodyParser.json());

    ServerService.initializeRoutes(router);
    app.use('/', router);

    app.listen(port, () => {
      console.log(`App listening on the port ${port}`);
    });

    ServerService.eventEmitter = new EventEmitter();
  }

  private static initializeRoutes(router: express.Router) {
    
    router.put('/game-state', (request: express.Request, response: express.Response) => {
      ServerService.eventEmitter.emit('onGameStateChanged', request.body.NewState);
      response.status(200).send();
    });

    router.put('/player-changed', (request: express.Request, response: express.Response) => {
      ServerService.eventEmitter.emit('onPlayerChanged', new PlayerUpdate(request.body));
      response.status(200).send();
    });
  }

  public reset(): void {

  }
  // TODO : rename into AmongUs instance manager
}