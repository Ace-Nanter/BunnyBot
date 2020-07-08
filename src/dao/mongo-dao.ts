import { MongoClient } from 'mongodb';
import { Logger } from '../logger/logger';
import { resolve } from 'path';
import { promises } from 'fs';
import { rejects } from 'assert';

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
            client.close();
        }
    }

    public getConfigs() : Promise<Config[]> {
        return this.operate(function(db) : Promise<Config[]> {
            return db.collection('config').find().toArray();
        });
    }
}