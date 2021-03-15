import * as express from 'express';
import * as socketio from "socket.io";
import { Instance } from './../models/instance.model';
import { ModuleRoutes } from './../module-routes';
export class InstanceService {

  private static singletonInstance: InstanceService = null;

  private moduleRoutes: ModuleRoutes = new ModuleRoutes();
  private instanceList: Map<number, Instance>;

  private constructor() { }

  public static getInstance(): InstanceService {

    if(!InstanceService.singletonInstance) {
      InstanceService.singletonInstance = new InstanceService();
    }

    return InstanceService.singletonInstance;
  }

  // TODO : penser à inclure des Observable et ObservableSubject de manière à envoyer automatiquement les majs


  public start(port: number): void {

    const app = express();
    app.set("port", port);

    let http = require("http").Server(app);
    
    // set up socket.io and bind it to our
    // http server.
    let io = require("socket.io")(http);

    /*
    app.get("/", (req: any, res: any) => {
      res.sendFile(path.resolve("./client/index.html"));
    });
    */

    // whenever a user connects on port 3000 via
    // a websocket, log that a user has connected
    io.on("connection", function(socket: any) {
      console.log("a user connected");

      socket.on("message", function(message: any) {
        console.log(message);
        socket.emit("message", "hey");
      });

      socket.on('disconnect', function () {
        console.log('socket disconnected : ' + socket.id);
    }); 
    });

    const server = http.listen(port, function() {
      console.log("listening on *:" + port);
    });

    //this.apiRoutes.route(this.app);
  }

  public push(instanceId: number, instance: Instance) {
    this.instanceList.set(instanceId, instance);
    // TODO : push in websocket
  }

  public reset(): void {

  }

}