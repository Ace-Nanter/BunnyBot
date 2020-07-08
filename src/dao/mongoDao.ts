import { MongoClient } from 'mongodb';

export class mongoDao implements dao {

    private client: MongoClient;
    private dbName: string;
    
    private getDatabase() : any {
        if(this.dbName && this.client) {
            return this.client.db(this.dbName);
        }
        return null;
    }

    public async openConnection(uri: string) {
        
        console.log('Connecting to mongo');
    
        try {
          if (!this.client) {
            this.client = await MongoClient.connect(uri, { useNewUrlParser: true });
          }
        } catch(e) {
          console.error(e);
        }    
    }

    public setDatabaseName(dbName: string) {
        this.dbName = dbName;
    }

    public async getConfig() {
        var self = this;

        await this.getDatabase().collection('config').find().toArray(function(err: any, configs: any[]) {
            if(err) {
                console.error('No configuration found!');
            }
            else {
                if(configs && configs.length > 0) console.log(configs);
            }
        });
    }

    public closeConnection() {
        if(this.client) {
            this.client.close();
        }
    }
}