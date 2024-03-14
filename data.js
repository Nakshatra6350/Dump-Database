const { MongoClient, ObjectId } = require("mongodb");
const mysql = require("mysql2/promise");

let connections = [];

async function fetchHostUserPassword(objectId) {
  const uri =
    "INSERT_YOUR_MONGO_URI_HERE";
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const database = client.db("graviton_microservice");
    const collection = database.collection("dumpConnectionDetails");

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

      console.log("Host, User, and Password are:", { host, user, password });
      console.log("Databases:", databases);

      connections = databases;
      console.log("Array of objects of data : ", connections);
      return connections;
    } else {
      console.log("Entry not found");
      return [];
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  } finally {
    await client.close();
  }
}

module.exports = fetchHostUserPassword;
