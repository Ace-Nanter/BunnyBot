import { MongoDao } from "./mongo-dao";
import { Logger } from "../logger/logger";

export class Dao {

    private static instance : DaoInterface = null;

    private constructor() { }

    public static initDao(type: DaoType, ...args: any[]) {
        switch(type) {
            case DaoType.Mongo:
                if(args && args.length === 2 && args[0] && args[1]) {
                    Dao.instance = new MongoDao(args[0], args[1]);
                }
                else {
                    Logger.error('Not enough arguments for for instanciating a MongoDao!');
                }
            break;
        }
    }

    public static getInstance() : DaoInterface {
        return Dao.instance;
    }


    
}