interface dao {

    // Open connection with database
    openConnection(uri : string);

    // Set database name
    setDatabaseName(dbName: string);

    // Get configuration from database
    getConfig();

    closeConnection(): void;
}