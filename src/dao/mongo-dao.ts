import { MongoClient } from 'mongodb';
import { Logger } from '../logger/logger';
import { ModulesListConfig } from '../models/config/module-config';
import { DaoInterface } from './dao.interface';
import { Game } from '../models/game.model';

export class MongoDao implements DaoInterface {

    public constructor(private dbUri: string, private dbName: string) { }

    private async operate(fn: (db: any) => Promise<any>) : Promise<any> {
        
        let client: MongoClient;

        try{
            client = await MongoClient.connect(this.dbUri, { useNewUrlParser: true, useUnifiedTopology: true });
            const db = client.db(this.dbName);
            
            const results = await fn(db);
            return Promise.resolve(results);
        }
        catch(e){
            Logger.error(e);
            return Promise.reject(e);
        } 
        finally{
            if(client) {
                client.close();
            }
        }
    }

    public getModulesConfigs() : Promise<ModulesListConfig> {
        return this.operate(function(db) : Promise<ModulesListConfig> {
            return db.collection('config').findOne({'name': 'modules'});
        });
    }

    public getGameList() : Promise<Game[]> {
        return this.operate(function(db) : Promise<Game[]> {
            return db.collection('games').find().toArray();
        });
    }

}