import { mongoDao } from './dao/mongoDao';

bot();

async function bot() {
    console.log("Lancement du process");
    const dao: dao = new mongoDao();        // TODO : envoyer les variables d'environnement dans constructeur pour initialisation

    await dao.openConnection('' + process.env.DATABASE_URI);

    dao.setDatabaseName(process.env.DATABASE_NAME);
    dao.getConfig();

    dao.closeConnection();
    //
//    const dao : Dao= new MongoDao();
    
}





