const mysql = require("mysql2/promise");
const mysqldump = require("mysqldump");
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const fetchHostUserPassword = require("./data.js");

const dir = "./databaseDumps";
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

cron.schedule(
  "0 0 * * *",
  async () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const dateFolderName = `${year}-${month}-${day}`;
    const time = `${currentDate.getHours()}-${currentDate.getMinutes()}-${
      currentDate.getSeconds
    }`;
    const folderPath = `${dir}/dump_${dateFolderName}_${time}`;

    async function dumpData(connectionObj) {
      const connection = await mysql.createConnection({
        host: connectionObj.host,
        user: connectionObj.user,
        password: connectionObj.password,
        database: connectionObj.dbName,
      });

      try {
        console.log(`Connected to MySQL database ${connectionObj.dbName}`);

        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath);
          console.log(`Folder created: ${folderPath}`);
        }

        await mysqldump({
          connection: {
            host: connectionObj.host,
            user: connectionObj.user,
            password: connectionObj.password,
            database: connectionObj.dbName,
          },
          dumpToFile: `${folderPath}/${connectionObj.host}_${connectionObj.dbName}.sql`,
        });

        console.log(`Database ${connectionObj.dbName} dumped successfully`);
      } catch (err) {
        console.error(`Error dumping database ${connectionObj.dbName}:`, err);
      } finally {
        await connection.end();
      }
    }

    async function deleteFolder() {
      const dumpFolder = await fs.promises.readdir(dir);
      if (dumpFolder.length > 7) {
        const oldestFolder = dumpFolder[0];
        const oldestFolderPath = path.join(dir, oldestFolder);
        await fs.promises.rm(oldestFolderPath, { recursive: true });
        console.log(`Folder deleted: ${oldestFolderPath}`);
      } else {
        console.log("less than or equal to 7 file");
      }
    }

    async function dumpAllData() {
      objectIds = ["65e9764cb3dcbd32db1542f3", "65e99126b3dcbd32db1542f4"];

      for (let i = 0; i < objectIds.length; i++) {
        // Fixed the loop condition
        const connections = await fetchHostUserPassword(objectIds[i]);
        for (const connectionObj of connections) {
          await dumpData(connectionObj);
        }
      }
    }

    console.log(
      "-----------------------------------------------------------------"
    );
    await dumpAllData();
    console.log("..........................DELETION........................");
    await deleteFolder();
  },
  {
    timezone: "Asia/Kolkata",
  }
);
