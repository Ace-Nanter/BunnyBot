import mongoose, { connect } from 'mongoose';

export interface MongoParams {
  uri: string;
  dbName: string;
  username: string;
  password: string;
}

export const mongoClient = ({ uri, dbName, username, password }: MongoParams) =>
  connect(uri, {
    dbName,
    auth: {
      username,
      password,
    },
    authSource: dbName,
  });

export const disconnectMongo = () => {
  mongoose.disconnect();
};

export default mongoClient;
