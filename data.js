const { MongoClient, ObjectId } = require("mongodb");
const mysql = require("mysql2/promise");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

let connections = [];
const logPath = ["logs/success.txt", "logs/error.txt"];

const fetchHostUserPassword = async (objectId) => {
  const client = new MongoClient(process.env.MONGO_URI);

  try {
    await client.connect();
    const database = client.db(process.env.DB_NAME);
    const collection = database.collection(process.env.COLLECTION_NAME);
    const query = { _id: new ObjectId(objectId) };
    const projection = { host: 1, user: 1, password: 1, _id: 0 };

    const result = await collection.findOne(query, { projection });

    if (result) {
      const { host, user, password } = result;

      const sqlConnection = await mysql.createConnection({
        host: host,
        user: user,
        password: password,
      });

      const [rows] = await sqlConnection.execute("SHOW DATABASES");

      const databases = rows
        .map((row) => row.Database)
        .filter(
          (dbName) =>
            dbName !== "information_schema" && dbName !== "performance_schema"
        )
        .map((dbName) => ({
          host: host,
          user: user,
          password: password,
          dbName: dbName,
        }));
      await sqlConnection.end();

      const logsFolder = path.dirname(logPath[0]);
      if (!fs.existsSync(logsFolder)) {
        fs.mkdirSync(logsFolder, { recursive: true });
        console.log(`Logs folder created: ${logsFolder}`);
      }

      fs.appendFileSync(
        logPath[0],
        `Host, User, and Password are: ${JSON.stringify(
          {
            host,
            user,
            password,
          },
          null,
          2
        )}\n`
      );
      connections = databases;

      fs.appendFileSync(
        logPath[0],
        `Array of objects containing host,user,password and database name for each database: ${JSON.stringify(
          connections,
          null,
          2
        )}\n`
      );
      return connections;
    } else {
      fs.appendFileSync(logPath[0], "objectId not found in mongo\n");
      return [];
    }
  } catch (error) {
    fs.appendFileSync(
      logPath[1],
      `Error fetching data from MongoDB : ${JSON.stringify(error)}`
    );
    return [];
  } finally {
    await client.close();
  }
};
module.exports = fetchHostUserPassword;
