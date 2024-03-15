const mysql = require("mysql2/promise");
const mysqldump = require("mysqldump");
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const fetchHostUserPassword = require("./data.js");
const getObjectId = require("./dbConnection.js");
const {
  databaseDir,
  successLogFunc,
  errorLogFunc,
} = require("./directories.js");
const getFolderPath = require("./dateAndTime.js");

cron.schedule(
  "0 0 * * *",
  async () => {
    const dir = databaseDir();
    const successLog = successLogFunc();
    const errorLog = errorLogFunc();
    const objectIds = await getObjectId();

    const time = getFolderPath();
    const folderPath = `${dir}/${time}`;

    async function dumpData(connectionObj) {
      const connection = await mysql.createConnection({
        host: connectionObj.host,
        user: connectionObj.user,
        password: connectionObj.password,
        database: connectionObj.dbName,
      });

      try {
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath);
          console.log(`Database folder created: ${folderPath}`);
        }
        fs.appendFileSync(
          successLog,
          `Connection to ${connectionObj.dbName} successfull\n`
        );

        await mysqldump({
          connection: {
            host: connectionObj.host,
            user: connectionObj.user,
            password: connectionObj.password,
            database: connectionObj.dbName,
          },
          dumpToFile: `${folderPath}/${connectionObj.host}_${connectionObj.dbName}.sql`,
        });

        fs.appendFileSync(
          successLog,
          `Database ${connectionObj.dbName} dumped successfully\n`
        );
      } catch (err) {
        fs.appendFileSync(
          successLog,
          `Error in dumping database ${connectionObj.dbName}, for more details check error.txt\n`
        );
        fs.appendFileSync(
          errorLog,
          `Error in dumping database ${connectionObj.dbName}: ${err} of localhost : ${connectionObj.host}\n`
        );
      } finally {
        await connection.end();
      }
    }

    async function deleteFolder() {
      const dumpFolder = await fs.promises.readdir(dir);
      if (dumpFolder.length > 4) {
        const oldestFolder = dumpFolder[0];
        const oldestFolderPath = path.join(dir, oldestFolder);
        await fs.promises.rm(oldestFolderPath, { recursive: true });
        console.log(`Database folder deleted: ${oldestFolderPath}`);
        fs.appendFileSync(
          successLog,
          `Database folder deleted: ${oldestFolderPath}\n`
        );
      }
    }

    async function dumpAllData() {
      let objectId;
      try {
        for (objectId of objectIds) {
          const connections = await fetchHostUserPassword(objectId);
          for (const connectionObj of connections) {
            await dumpData(connectionObj);
          }
        }
      } catch (err) {
        if (objectId) {
          fs.appendFileSync(
            errorLog,
            `Error in getting documentId ${objectId} from mongo document: ${err}\n`
          );
        } else {
          fs.appendFileSync(errorLog, `Error occurred: ${err}\n`);
        }
      }
    }
    await dumpAllData();
    await deleteFolder();
  },
  {
    timezone: "Asia/Kolkata",
  }
);
