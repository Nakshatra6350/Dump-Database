const fs = require("fs");
const path = require("path");
const databaseDir = () => {
  const dir = "./databaseDumps";
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  return dir;
};

const logPathDir = () => {
  const logs = "./logs";
  if (!fs.existsSync(logs)) {
    fs.mkdirSync(logs);
  }
  return logs;
};

const logs = logPathDir();

const successLogFunc = () => {
  const successLog = path.join(String(logs), "success.txt");
  if (!fs.existsSync(successLog)) {
    fs.writeFileSync(successLog, "");
    console.log(`Logs file created: ${successLog}`);
  }
  return successLog;
};
const errorLogFunc = () => {
  const errorLog = path.join(String(logs), "error.txt");
  if (!fs.existsSync(errorLog)) {
    fs.writeFileSync(errorLog, "");
    console.log(`Logs file created: ${errorLog}`);
  }
  return errorLog;
};

module.exports = { databaseDir, logPathDir, successLogFunc, errorLogFunc };
